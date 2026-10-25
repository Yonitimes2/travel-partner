import { addDays, earliestStart, isOpen } from "../dates";
import { PLANNED_LIMIT, activePlanned, phoneDigits } from "../rules";
import { db, type Row } from "./db";
import type { Email } from "./email";
import { answeredEmail, approvedEmail, messageEmail, newRequestEmail, reportEmail } from "./emails";
import { adminsOf, blockedBetween, requestById, toTrip, tripById, userById, type Q, type ServerUser } from "./repo";
import type { Action, TripInputParsed } from "./schemas";
import { israelToday } from "./view";
import type { JoinRequest, Trip } from "../types";

/**
 * What a signed-in person can do. Every rule the app shows is enforced here as well, since the app
 * runs in the person's browser. Returns the emails to send once the change is saved.
 */

export class ActionError extends Error {
  constructor(
    public code: string,
    public status = 400,
  ) {
    super(code);
  }
}

/** a chat sends at most one email per hour to each side */
const CHAT_EMAIL_MINUTES = 60;

const json = (v: unknown) => (v === undefined ? null : JSON.stringify(v));

export async function runAction(me: ServerUser, a: Action): Promise<(Email | null)[]> {
  if (me.status !== "active") throw new ActionError("not_active", 403);
  const q = await db();
  const today = israelToday();
  const now = new Date();

  switch (a.type) {
    case "createTrip": {
      const trip = checkTrip(a.trip, today, null);
      if (trip.kind === "planned") {
        const [rows] = await q.query<Row[]>("SELECT * FROM trips WHERE owner_id = ?", [me.id]);
        if (activePlanned(rows.map(toTrip), me.id, today) >= PLANNED_LIMIT) throw new ActionError("planned_limit");
      }
      await q.query(
        `INSERT INTO trips (id, owner_id, kind, status, area, place, photo, start_date, end_date, flex, wanted, styles, description, deadline, created_at, updated_at)
          VALUES (?, ?, ?, 'open', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [a.id, me.id, trip.kind, trip.area, trip.place, trip.photo ?? null, trip.startDate, trip.endDate, json(trip.flex), trip.wanted,
          json(trip.styles), trip.description, json(trip.deadline), now, now],
      );
      return [];
    }

    case "updateTrip": {
      const old = await ownTrip(q, me, a.id);
      // closing is the paid step, and a closed trip stays closed
      if (old.kind === "closed" && a.trip.kind === "planned") throw new ActionError("closed_is_final");
      const trip = checkTrip(a.trip, today, old);
      await q.query(
        `UPDATE trips SET kind = ?, area = ?, place = ?, photo = ?, start_date = ?, end_date = ?, flex = ?, wanted = ?, styles = ?,
          description = ?, deadline = ?, updated_at = ? WHERE id = ?`,
        [trip.kind, trip.area, trip.place, trip.photo ?? null, trip.startDate, trip.endDate, json(trip.flex), trip.wanted,
          json(trip.styles), trip.description, json(trip.deadline), now, a.id],
      );
      return [];
    }

    case "closeTrip": {
      const trip = await ownTrip(q, me, a.id);
      // a closed trip's dates are final: the first option stays (free while the beta lasts)
      if (trip.kind === "planned") await q.query("UPDATE trips SET kind = 'closed', flex = NULL, updated_at = ? WHERE id = ?", [now, a.id]);
      return [];
    }

    case "setTripStatus": {
      await ownTrip(q, me, a.id);
      await q.query("UPDATE trips SET status = ?, updated_at = ? WHERE id = ?", [a.status, now, a.id]);
      return [];
    }

    case "deleteTrip": {
      await ownTrip(q, me, a.id);
      await q.query("DELETE FROM trips WHERE id = ?", [a.id]);
      return [];
    }

    case "askToJoin": {
      const trip = await tripById(q, a.tripId);
      const owner = trip && (await userById(q, trip.ownerId));
      if (!trip || !owner) throw new ActionError("not_found", 404);
      if (owner.id === me.id) throw new ActionError("own_trip");
      const visible = owner.status === "active" && (owner.gender === me.gender || trip.wanted === "families");
      if (!visible || (await blockedBetween(q, me.id, owner.id))) throw new ActionError("not_found", 404);
      if (!isOpen(trip, today)) throw new ActionError("trip_not_open");
      const request: JoinRequest = { id: a.id, tripId: trip.id, fromUserId: me.id, note: a.note, party: a.party, status: "pending", createdAt: now.toISOString() };
      try {
        await q.query(
          "INSERT INTO requests (id, trip_id, from_user_id, note, party, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)",
          [a.id, trip.id, me.id, a.note, json(a.party), now, now],
        );
      } catch (e) {
        if ((e as { code?: string }).code === "ER_DUP_ENTRY") throw new ActionError("already_asked");
        throw e;
      }
      return [newRequestEmail(owner, me, trip, request)];
    }

    case "respond": {
      const request = await requestById(q, a.requestId);
      const trip = request && (await tripById(q, request.tripId));
      if (!request || !trip || trip.ownerId !== me.id) throw new ActionError("not_found", 404);
      if (request.status !== "pending") throw new ActionError("already_answered");
      // only a closed trip can accept partners
      if (a.status === "accepted" && trip.kind !== "closed") throw new ActionError("must_close");
      await q.query("UPDATE requests SET status = ?, updated_at = ? WHERE id = ?", [a.status, now, request.id]);
      const from = await userById(q, request.fromUserId);
      return from ? [answeredEmail(from, me, trip, { ...request, status: a.status })] : [];
    }

    case "sendMessage": {
      const request = await requestById(q, a.requestId);
      const trip = request && (await tripById(q, request.tripId));
      if (!request || !trip || request.status !== "accepted") throw new ActionError("not_found", 404);
      const otherId = trip.ownerId === me.id ? request.fromUserId : request.fromUserId === me.id ? trip.ownerId : null;
      const other = otherId && (await userById(q, otherId));
      if (!other || (await blockedBetween(q, me.id, other.id))) throw new ActionError("not_found", 404);
      await q.query("INSERT INTO messages (id, request_id, from_user_id, text, at) VALUES (?, ?, ?, ?, ?)", [a.id, request.id, me.id, a.text, now]);
      return (await firstInAWhile(q, `chat:${request.id}:${other.id}`, CHAT_EMAIL_MINUTES)) ? [messageEmail(other, me, trip, request, a.text)] : [];
    }

    case "report": {
      const about = await userById(q, a.aboutUserId);
      if (!about || about.id === me.id) throw new ActionError("not_found", 404);
      await q.query(
        "INSERT INTO reports (id, from_user_id, about_user_id, reason, text, status, created_at) VALUES (?, ?, ?, ?, ?, 'open', ?)",
        [a.id, me.id, about.id, a.reason, a.text, now],
      );
      const admins = (await adminsOf(q, about.gender)).filter((ad) => ad.id !== about.id);
      return admins.map((ad) => reportEmail(ad, me, about, a.reason, a.text));
    }

    case "block": {
      if (a.userId === me.id || !(await userById(q, a.userId))) throw new ActionError("not_found", 404);
      await q.query("INSERT IGNORE INTO blocks (by_user, who, created_at) VALUES (?, ?, ?)", [me.id, a.userId, now]);
      return [];
    }

    case "unblock": {
      await q.query("DELETE FROM blocks WHERE by_user = ? AND who = ?", [me.id, a.userId]);
      return [];
    }

    case "updateProfile": {
      const p = a.patch;
      const set: Record<string, unknown> = {
        nickname: p.nickname,
        avatar: p.avatar,
        full_name: p.fullName,
        phone: p.phone && phoneDigits(p.phone),
        party: json(p.party),
        age_group: p.ageGroup,
        observance: p.observance,
        pace: p.pace,
        city: p.city,
        about: p.about,
        notify: json(p.notify),
      };
      const cols = Object.entries(set).filter(([, v]) => v !== undefined && v !== null);
      if (cols.length) {
        await q.query(`UPDATE users SET ${cols.map(([c]) => `${c} = ?`).join(", ")}, updated_at = ? WHERE id = ?`, [
          ...cols.map(([, v]) => v),
          now,
          me.id,
        ]);
      }
      return [];
    }

    // ---------- the section's admins ----------

    case "setUserStatus": {
      const user = await userById(q, a.userId);
      if (!user || !me.adminOf.includes(user.gender)) throw new ActionError("forbidden", 403);
      if (user.id === me.id) throw new ActionError("not_yourself");
      await q.query("UPDATE users SET status = ?, updated_at = ? WHERE id = ?", [a.status, now, user.id]);
      return user.status === "pending" && a.status === "active" ? [approvedEmail(user)] : [];
    }

    case "handleReport": {
      const [rows] = await q.query<Row[]>(
        "SELECT a.gender FROM reports r JOIN users a ON a.id = r.about_user_id WHERE r.id = ?",
        [a.reportId],
      );
      if (!rows[0] || !me.adminOf.includes(rows[0].gender)) throw new ActionError("forbidden", 403);
      await q.query("UPDATE reports SET status = 'handled' WHERE id = ?", [a.reportId]);
      return [];
    }
  }
}

async function ownTrip(q: Q, me: ServerUser, id: string): Promise<Trip> {
  const trip = await tripById(q, id);
  if (!trip || trip.ownerId !== me.id) throw new ActionError("not_found", 404);
  return trip;
}

/** the trip form's rules (dates in order, not in the past, the deadline before the earliest departure) */
function checkTrip(input: TripInputParsed, today: string, old: Trip | null): TripInputParsed {
  // a day's slack for people whose "today" is still yesterday in Israel
  const earliestAllowed = addDays(today, -1);
  const trip: TripInputParsed = { ...input, flex: input.kind === "planned" ? (input.flex ?? { type: "fixed" }) : undefined };
  if (trip.endDate < trip.startDate) throw new ActionError("bad_dates");
  if ((!old || old.startDate !== trip.startDate) && trip.startDate < earliestAllowed) throw new ActionError("bad_dates");
  if (trip.flex?.type === "alt" && (trip.flex.startDate === trip.startDate || trip.flex.startDate < earliestAllowed)) throw new ActionError("bad_dates");
  const earliest = earliestStart({ ...(trip as Trip), id: "", ownerId: "", status: "open", createdAt: "" });
  const last = trip.deadline.type === "date" ? trip.deadline.date : addDays(earliest, -trip.deadline.days);
  if (last > earliest) throw new ActionError("bad_deadline");
  return trip;
}

/** true (and remembered) when nothing with this key was sent in the last `minutes` */
async function firstInAWhile(q: Q, key: string, minutes: number): Promise<boolean> {
  const since = new Date(Date.now() - minutes * 60_000);
  const [rows] = await q.query<Row[]>("SELECT sent_at FROM email_throttle WHERE k = ?", [key]);
  if (rows[0] && new Date(rows[0].sent_at) > since) return false;
  await q.query("INSERT INTO email_throttle (k, sent_at) VALUES (?, ?) ON DUPLICATE KEY UPDATE sent_at = VALUES(sent_at)", [key, new Date()]);
  return true;
}

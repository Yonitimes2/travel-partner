import { tx } from "./db";
import { israelToday } from "./view";
import { makeSeed } from "../seed";

/**
 * Empties the database and fills it with the sample data (src/lib/seed.ts, dates relative to today).
 * Used by the development strip (/api/dev/seed) and by `npm run db:seed`.
 */
export async function fillSampleData() {
  const data = makeSeed(israelToday(), new Date());
  const j = JSON.stringify;
  const at = (iso: string) => new Date(iso);

  await tx(async (c) => {
    for (const table of ["messages", "requests", "reports", "blocks", "trips", "users", "login_codes", "email_throttle"]) {
      await c.query(`DELETE FROM ${table}`);
    }
    // everyone first, then who recommended whom (a recommender may come later in the list)
    for (const u of data.users) {
      await c.query(
        `INSERT INTO users (id, email, gender, nickname, avatar, full_name, phone, party, age_group, observance, pace, city, about,
          status, referred_by, referral, history, notify, admin_of, lang, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?)`,
        [u.id, u.email, u.gender, u.nickname, u.avatar, u.fullName, u.phone, j(u.party), u.ageGroup, u.observance, u.pace, u.city,
          u.about, u.status, u.referral ? j(u.referral) : null, j(u.history), j(u.notify), u.adminOf.join(","),
          u.lang, at(u.createdAt), at(u.createdAt)],
      );
    }
    for (const u of data.users) {
      if (u.referredBy) await c.query("UPDATE users SET referred_by = ? WHERE id = ?", [u.referredBy, u.id]);
    }
    for (const t of data.trips) {
      await c.query(
        `INSERT INTO trips (id, owner_id, kind, status, area, place, photo, start_date, end_date, flex, wanted, styles, description, deadline, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.id, t.ownerId, t.kind, t.status, t.area, t.place, t.photo ?? null, t.startDate, t.endDate, t.flex ? j(t.flex) : null, t.wanted,
          j(t.styles), t.description, j(t.deadline), at(t.createdAt), at(t.createdAt)],
      );
    }
    for (const r of data.requests) {
      await c.query(
        "INSERT INTO requests (id, trip_id, from_user_id, note, party, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [r.id, r.tripId, r.fromUserId, r.note, j(r.party), r.status, at(r.createdAt), at(r.createdAt)],
      );
    }
    for (const m of data.messages) {
      await c.query("INSERT INTO messages (id, request_id, from_user_id, text, at) VALUES (?, ?, ?, ?, ?)", [m.id, m.requestId, m.fromUserId, m.text, at(m.at)]);
    }
    for (const r of data.reports) {
      await c.query(
        "INSERT INTO reports (id, from_user_id, about_user_id, reason, text, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [r.id, r.fromUserId, r.aboutUserId, r.reason, r.text, r.status, at(r.createdAt)],
      );
    }
  });

  return { users: data.users.length, trips: data.trips.length, requests: data.requests.length, messages: data.messages.length };
}

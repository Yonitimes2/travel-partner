import { tx } from "@/lib/server/db";
import { israelToday } from "@/lib/server/view";
import { startSession } from "@/lib/server/session";
import { DEMO_MAN, makeSeed } from "@/lib/seed";

/** development only: empties the database, fills it with the sample data, and signs in as the sample man */
export async function POST() {
  if (process.env.NODE_ENV === "production") return new Response(null, { status: 404 });
  const data = makeSeed(israelToday(), new Date());
  const j = JSON.stringify;
  const at = (iso: string) => new Date(iso);

  await tx(async (c) => {
    for (const table of ["messages", "requests", "reports", "blocks", "trips", "users", "login_codes", "email_throttle"]) {
      await c.query(`DELETE FROM ${table}`);
    }
    for (const u of data.users) {
      await c.query(
        `INSERT INTO users (id, email, gender, nickname, avatar, full_name, phone, party, age_group, observance, pace, city, about,
          status, referred_by, referral, history, notify, admin_of, lang, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [u.id, u.email, u.gender, u.nickname, u.avatar, u.fullName, u.phone, j(u.party), u.ageGroup, u.observance, u.pace, u.city,
          u.about, u.status, u.referredBy ?? null, u.referral ? j(u.referral) : null, j(u.history), j(u.notify), u.adminOf.join(","),
          u.lang, at(u.createdAt), at(u.createdAt)],
      );
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
  await startSession(DEMO_MAN, 1);
  return Response.json({ ok: true });
}

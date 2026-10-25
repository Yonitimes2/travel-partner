/**
 * Fills the database with the prototype's sample data (src/lib/seed.ts), replacing whatever is there.
 * Needs DATABASE_URL in .env.local; to reach the server's database, run `npm run db:tunnel` first.
 *
 *   npm run db:seed
 */
import mysql from "mysql2/promise";
import { todayISO } from "../src/lib/dates";
import { makeSeed } from "../src/lib/seed";

process.loadEnvFile(".env.local");
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is missing from .env.local");

const db = await mysql.createConnection({ uri: url, timezone: "Z", charset: "utf8mb4" });
const { users, trips, requests, messages, reports, blocks } = makeSeed(todayISO(), new Date());
const at = (iso: string) => new Date(iso);
const json = (value: unknown) => JSON.stringify(value);

try {
  await db.beginTransaction();
  for (const table of ["blocks", "reports", "messages", "join_requests", "trips", "users"]) {
    await db.query(`DELETE FROM ${table}`);
  }

  for (const u of users) {
    await db.execute(
      `INSERT INTO users (id, nickname, full_name, phone, gender, avatar, age_group, observance, pace, party, city, about,
         status, referral_name, referral_phone, notify_push, notify_email, history_trips, history_joined, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        u.id, u.nickname, u.fullName, u.phone.replace(/\D/g, ""), u.gender, u.avatar, u.ageGroup, u.observance, u.pace,
        json(u.party), u.city, u.about, u.status, u.referral?.name ?? null, u.referral?.phone.replace(/\D/g, "") ?? null,
        u.notify.push, u.notify.email, u.history.trips, u.history.joined, at(u.createdAt),
      ],
    );
  }
  // who recommended whom, once everyone exists
  for (const u of users.filter((u) => u.referredBy)) {
    await db.execute("UPDATE users SET referred_by = ? WHERE id = ?", [u.referredBy, u.id]);
  }

  for (const t of trips) {
    const flex = t.kind === "planned" ? t.flex : undefined;
    await db.execute(
      `INSERT INTO trips (id, owner_id, kind, status, area, place, photo, start_date, end_date, flex_type, flex_alt_start,
         flex_range_days, wanted, styles, description, deadline_type, deadline_date, deadline_days, closed_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        t.id, t.ownerId, t.kind, t.status, t.area, t.place, t.photo ?? null, t.startDate, t.endDate,
        flex?.type ?? "fixed", flex?.type === "alt" ? flex.startDate : null, flex?.type === "range" ? flex.days : null,
        t.wanted, json(t.styles), t.description, t.deadline.type,
        t.deadline.type === "date" ? t.deadline.date : null, t.deadline.type === "daysBefore" ? t.deadline.days : null,
        t.kind === "closed" ? at(t.createdAt) : null, at(t.createdAt),
      ],
    );
  }

  for (const r of requests) {
    await db.execute(
      `INSERT INTO join_requests (id, trip_id, from_user_id, note, party, status, created_at, decided_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.tripId, r.fromUserId, r.note, json(r.party), r.status, at(r.createdAt), r.status === "pending" ? null : at(r.createdAt)],
    );
  }

  for (const m of messages) {
    await db.execute("INSERT INTO messages (id, request_id, from_user_id, text, created_at) VALUES (?, ?, ?, ?, ?)", [
      m.id, m.requestId, m.fromUserId, m.text, at(m.at),
    ]);
  }

  for (const r of reports) {
    await db.execute(
      "INSERT INTO reports (id, from_user_id, about_user_id, reason, text, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [r.id, r.fromUserId, r.aboutUserId, r.reason, r.text, r.status, at(r.createdAt)],
    );
  }

  for (const b of blocks) {
    await db.execute("INSERT INTO blocks (by_user_id, blocked_user_id) VALUES (?, ?)", [b.by, b.who]);
  }

  await db.commit();
  console.log(
    `seeded: ${users.length} users, ${trips.length} trips, ${requests.length} requests, ${messages.length} messages, ${reports.length} reports`,
  );
} catch (error) {
  await db.rollback();
  throw error;
} finally {
  await db.end();
}

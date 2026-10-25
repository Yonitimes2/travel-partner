import { db, type Conn, type Row } from "./db";
import { statsOf } from "../rules";
import type { Gender, JoinRequest, Message, Report, Stats, Trip, User } from "../types";

/** Rows ↔ the app's types. Users come back complete here; what each viewer may see is cut in view.ts. */

export type Q = Conn | Awaited<ReturnType<typeof db>>;

export interface ServerUser extends Omit<User, "stats"> {
  sessionVersion: number;
}

const iso = (d: Date | null) => (d ? new Date(d).toISOString() : "");

export function toUser(r: Row): ServerUser {
  return {
    id: r.id,
    email: r.email,
    gender: r.gender,
    nickname: r.nickname,
    avatar: r.avatar,
    fullName: r.full_name,
    phone: r.phone,
    party: r.party,
    ageGroup: r.age_group,
    observance: r.observance,
    pace: r.pace,
    city: r.city,
    about: r.about,
    status: r.status,
    referredBy: r.referred_by ?? undefined,
    referral: r.referral ?? undefined,
    history: r.history,
    notify: r.notify,
    adminOf: r.admin_of ? (String(r.admin_of).split(",") as Gender[]) : [],
    lang: r.lang,
    sessionVersion: r.session_version,
    createdAt: iso(r.created_at),
  };
}

export function toTrip(r: Row): Trip {
  return {
    id: r.id,
    ownerId: r.owner_id,
    kind: r.kind,
    status: r.status,
    area: r.area,
    place: r.place,
    photo: r.photo ?? undefined,
    startDate: r.start_date,
    endDate: r.end_date,
    flex: r.flex ?? undefined,
    wanted: r.wanted,
    styles: r.styles,
    description: r.description,
    deadline: r.deadline,
    createdAt: iso(r.created_at),
  };
}

export function toRequest(r: Row): JoinRequest {
  return {
    id: r.id,
    tripId: r.trip_id,
    fromUserId: r.from_user_id,
    note: r.note,
    party: r.party,
    status: r.status,
    createdAt: iso(r.created_at),
  };
}

export const toMessage = (r: Row): Message => ({ id: r.id, requestId: r.request_id, fromUserId: r.from_user_id, text: r.text, at: iso(r.at) });

export const toReport = (r: Row): Report => ({
  id: r.id,
  fromUserId: r.from_user_id,
  aboutUserId: r.about_user_id,
  reason: r.reason,
  text: r.text,
  status: r.status,
  createdAt: iso(r.created_at),
});

export async function userById(q: Q, id: string): Promise<ServerUser | null> {
  const [rows] = await q.query<Row[]>("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0] ? toUser(rows[0]) : null;
}

export async function userByEmail(q: Q, email: string): Promise<ServerUser | null> {
  const [rows] = await q.query<Row[]>("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] ? toUser(rows[0]) : null;
}

export async function tripById(q: Q, id: string): Promise<Trip | null> {
  const [rows] = await q.query<Row[]>("SELECT * FROM trips WHERE id = ?", [id]);
  return rows[0] ? toTrip(rows[0]) : null;
}

export async function requestById(q: Q, id: string): Promise<JoinRequest | null> {
  const [rows] = await q.query<Row[]>("SELECT * FROM requests WHERE id = ?", [id]);
  return rows[0] ? toRequest(rows[0]) : null;
}

/** the section's active admins, who get the sign-up and report emails */
export async function adminsOf(q: Q, gender: Gender): Promise<ServerUser[]> {
  const [rows] = await q.query<Row[]>("SELECT * FROM users WHERE status = 'active' AND FIND_IN_SET(?, admin_of)", [gender]);
  return rows.map(toUser);
}

/** true when one of the two blocked the other */
export async function blockedBetween(q: Q, a: string, b: string): Promise<boolean> {
  const [rows] = await q.query<Row[]>("SELECT 1 FROM blocks WHERE (by_user = ? AND who = ?) OR (by_user = ? AND who = ?) LIMIT 1", [a, b, b, a]);
  return rows.length > 0;
}

/** activity points for these people, from every accepted request on their trips */
export async function statsFor(q: Q, users: ServerUser[]): Promise<Map<string, Stats>> {
  const out = new Map<string, Stats>();
  if (!users.length) return out;
  const [rows] = await q.query<Row[]>(
    `SELECT r.id, r.trip_id, r.party, t.owner_id FROM requests r JOIN trips t ON t.id = r.trip_id
      WHERE r.status = 'accepted' AND t.owner_id IN (?)`,
    [users.map((u) => u.id)],
  );
  const trips = [...new Map(rows.map((r) => [r.trip_id, { id: r.trip_id, ownerId: r.owner_id } as Trip])).values()];
  const requests = rows.map((r) => ({ id: r.id, tripId: r.trip_id, party: r.party, status: "accepted" }) as JoinRequest);
  for (const u of users) out.set(u.id, statsOf(u, trips, requests));
  return out;
}

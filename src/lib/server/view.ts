import { addDays } from "../dates";
import { db, type Row } from "./db";
import { statsFor, toMessage, toReport, toRequest, toTrip, toUser, type ServerUser } from "./repo";
import type { AppData, Gender, User } from "../types";

/** today as a calendar day in Israel, whatever the server's own time zone */
export const israelToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(new Date());

/**
 * Everything one person may see, and nothing more:
 * - trips of their own section (and family trips from both), their own trips, and trips they asked to join;
 *   people who blocked each other disappear from each other's view
 * - requests they sent and requests on their trips; chats of accepted requests only
 * - other people's full name, phone and email only for the admins of that person's section
 * - someone who asked to join my *planned* trip: only their nickname and avatar
 * - for admins: every member of their sections, their recommenders, and reports about them
 */
export async function viewFor(me: ServerUser): Promise<AppData> {
  const q = await db();
  const today = israelToday();
  const isAdminOf = (g: Gender) => me.adminOf.includes(g);

  const [blockRows] = await q.query<Row[]>("SELECT by_user, who FROM blocks WHERE by_user = ? OR who = ?", [me.id, me.id]);
  const blocked = new Set(blockRows.map((b) => (b.by_user === me.id ? b.who : b.by_user)));
  const blocks = blockRows.filter((b) => b.by_user === me.id).map((b) => ({ by: b.by_user, who: b.who }));

  const [tripRows] = await q.query<Row[]>(
    `SELECT t.* FROM trips t JOIN users o ON o.id = t.owner_id
      WHERE t.owner_id = ?
         OR t.id IN (SELECT trip_id FROM requests WHERE from_user_id = ?)
         OR (o.status = 'active' AND t.end_date >= ? AND (o.gender = ? OR t.wanted = 'families'))`,
    [me.id, me.id, addDays(today, -30), me.gender],
  );
  const trips = tripRows.map(toTrip).filter((t) => t.ownerId === me.id || !blocked.has(t.ownerId));
  const tripIds = new Set(trips.map((t) => t.id));
  const myTrips = new Map(trips.filter((t) => t.ownerId === me.id).map((t) => [t.id, t]));

  const [requestRows] = await q.query<Row[]>(
    "SELECT * FROM requests WHERE from_user_id = ? OR trip_id IN (SELECT id FROM trips WHERE owner_id = ?) ORDER BY created_at",
    [me.id, me.id],
  );
  const requests = requestRows.map(toRequest).filter((r) => tripIds.has(r.tripId) && !blocked.has(r.fromUserId));

  const chats = requests.filter((r) => r.status === "accepted").map((r) => r.id);
  const [messageRows] = chats.length
    ? await q.query<Row[]>("SELECT * FROM messages WHERE request_id IN (?) ORDER BY at, id", [chats])
    : [[] as Row[]];
  const messages = messageRows.map(toMessage);

  // whose full public profile I see, and who only shows a nickname
  const full = new Set<string>([me.id, ...trips.map((t) => t.ownerId)]);
  const limited = new Set<string>();
  for (const r of requests) {
    const onMine = myTrips.get(r.tripId);
    if (!onMine) continue;
    if (onMine.kind === "closed" || r.status === "accepted") full.add(r.fromUserId);
    else limited.add(r.fromUserId);
  }

  let reports: AppData["reports"] = [];
  const people = new Map<string, ServerUser>();
  if (me.adminOf.length) {
    const [reportRows] = await q.query<Row[]>(
      `SELECT r.* FROM reports r JOIN users a ON a.id = r.about_user_id WHERE a.gender IN (?) ORDER BY r.created_at DESC`,
      [me.adminOf],
    );
    reports = reportRows.map(toReport);
    const [memberRows] = await q.query<Row[]>("SELECT * FROM users WHERE gender IN (?)", [me.adminOf]);
    for (const u of memberRows.map(toUser)) {
      people.set(u.id, u);
      full.add(u.id);
      if (u.referredBy) full.add(u.referredBy);
    }
    for (const r of reports) full.add(r.fromUserId).add(r.aboutUserId);
  }

  const wanted = [...new Set([...full, ...limited])].filter((id) => !people.has(id));
  if (wanted.length) {
    const [rows] = await q.query<Row[]>("SELECT * FROM users WHERE id IN (?)", [wanted]);
    for (const u of rows.map(toUser)) people.set(u.id, u);
  }

  const shown = [...people.values()].filter((u) => u.id === me.id || !blocked.has(u.id) || isAdminOf(u.gender));
  const stats = await statsFor(q, shown.filter((u) => full.has(u.id)));

  const users: User[] = shown.map((u) => {
    if (!full.has(u.id)) return nicknameOnly(u);
    const { sessionVersion: _, ...rest } = u;
    const user: User = { ...rest, stats: stats.get(u.id) ?? { trips: 0, joined: 0, points: 0 } };
    if (u.id === me.id) return user;
    const others = { notify: { push: false, email: false }, adminOf: [], lang: "he" as const };
    if (isAdminOf(u.gender)) return { ...user, ...others };
    return { ...user, ...others, fullName: "", phone: "", email: "", referral: undefined, referredBy: undefined };
  });

  return { meId: me.id, users, trips, requests, messages, reports, blocks };
}

function nicknameOnly(u: ServerUser): User {
  return {
    id: u.id,
    nickname: u.nickname,
    avatar: u.avatar,
    gender: u.gender,
    limited: true,
    fullName: "",
    phone: "",
    email: "",
    party: { type: "solo" },
    ageGroup: "26-35",
    observance: "kosher",
    pace: "medium",
    city: "",
    about: "",
    status: u.status,
    history: { trips: 0, joined: 0 },
    stats: { trips: 0, joined: 0, points: 0 },
    notify: { push: false, email: false },
    adminOf: [],
    lang: "he",
    createdAt: "",
  };
}

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { db, type Row } from "./db";
import { serverKey } from "./keys";
import { userById, type ServerUser } from "./repo";
import { readSession } from "./session";

export function jsonError(status: number, code: string) {
  return Response.json({ error: code }, { status });
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** the signed-in person, checked against the database (a changed session version signs them out) */
export async function currentUser(): Promise<ServerUser | null> {
  const s = await readSession();
  if (!s) return null;
  const user = await userById(await db(), s.userId);
  return user && user.sessionVersion === s.version ? user : null;
}

/** emails in ADMIN_EMAILS run both sections from the start: they let the first people in */
export const isFounder = (email: string) =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email);

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const isEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 190;

// ---------- sign-in codes ----------

const CODE_MINUTES = 10;
const CODE_ATTEMPTS = 5;
/** codes one address can ask for in CODE_WINDOW minutes */
const CODES_PER_EMAIL = 3;
const CODE_WINDOW = 15;

const hashCode = async (email: string, code: string) =>
  createHmac("sha256", await serverKey("AUTH_SECRET", "session.key")).update(`code:${email}:${code}`).digest("hex");

/** a new 6-digit code for this email, or null when it asked for too many lately */
export async function newCode(email: string): Promise<string | null> {
  const q = await db();
  const since = new Date(Date.now() - CODE_WINDOW * 60_000);
  const [recent] = await q.query<Row[]>("SELECT COUNT(*) AS n FROM login_codes WHERE email = ? AND created_at > ?", [email, since]);
  if (recent[0].n >= CODES_PER_EMAIL) return null;
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const now = new Date();
  await q.query("INSERT INTO login_codes (email, hash, expires_at, created_at) VALUES (?, ?, ?, ?)", [
    email,
    await hashCode(email, code),
    new Date(now.getTime() + CODE_MINUTES * 60_000),
    now,
  ]);
  // old codes of everyone are no longer needed
  await q.query("DELETE FROM login_codes WHERE created_at < ?", [new Date(Date.now() - 86_400_000)]);
  return code;
}

/** checks the latest code sent to this email; a right code can be used once */
export async function checkCode(email: string, code: string): Promise<"ok" | "wrong" | "expired"> {
  const q = await db();
  const [rows] = await q.query<Row[]>("SELECT * FROM login_codes WHERE email = ? ORDER BY created_at DESC, id DESC LIMIT 1", [email]);
  const row = rows[0];
  if (!row || new Date(row.expires_at).getTime() < Date.now() || row.attempts >= CODE_ATTEMPTS) return "expired";
  const expected = Buffer.from(row.hash, "hex");
  const actual = Buffer.from(await hashCode(email, code), "hex");
  if (!timingSafeEqual(expected, actual)) {
    await q.query("UPDATE login_codes SET attempts = attempts + 1 WHERE id = ?", [row.id]);
    return row.attempts + 1 >= CODE_ATTEMPTS ? "expired" : "wrong";
  }
  await q.query("DELETE FROM login_codes WHERE email = ?", [email]);
  return "ok";
}

// ---------- per-address throttle (in memory; one server process) ----------

const hits = new Map<string, number[]>();

export function clientIp(req: Request) {
  // Apache in front of the app adds X-Forwarded-For (and drops one the client sent); the app listens on 127.0.0.1 only
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

/** counts one hit for `key`; false when there were already `max` in the last `minutes` */
export function allow(key: string, max: number, minutes: number): boolean {
  const since = Date.now() - minutes * 60_000;
  const recent = (hits.get(key) ?? []).filter((t) => t > since);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  hits.set(key, [...recent, Date.now()]);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => t > since)) hits.delete(k);
  return true;
}

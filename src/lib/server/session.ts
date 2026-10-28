import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { serverKey } from "./keys";

/**
 * Signed cookies: base64url(JSON payload) + "." + HMAC-SHA256 signature.
 * - the session (who is signed in, checked against the user's session version on every request)
 * - the sign-up ticket: an email that was just verified by a code but has no account yet
 */

import { SESSION_COOKIE } from "../auth-cookie";

export { SESSION_COOKIE };
export const SIGNUP_COOKIE = "tp_signup";
const SESSION_DAYS = 60;
const SIGNUP_MINUTES = 60;

interface SessionPayload {
  k: "s";
  /** user id */
  u: string;
  /** the user's session version when the cookie was issued */
  v: number;
  /** expiry, ms since epoch */
  e: number;
}

interface SignupPayload {
  k: "t";
  /** the verified email */
  m: string;
  e: number;
}

/** AUTH_SECRET from the environment, or a random key generated once into the data dir. */
const getSecret = () => serverKey("AUTH_SECRET", "session.key");

const sign = async (data: string) => createHmac("sha256", await getSecret()).update(data).digest();

async function seal(payload: SessionPayload | SignupPayload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${(await sign(data)).toString("base64url")}`;
}

async function open(token: string | undefined): Promise<SessionPayload | SignupPayload | null> {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = await sign(data);
  const actual = Buffer.from(sig, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    return p && typeof p.e === "number" && p.e > Date.now() ? p : null;
  } catch {
    return null;
  }
}

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}

export async function readSession(): Promise<{ userId: string; version: number } | null> {
  const p = await open((await cookies()).get(SESSION_COOKIE)?.value);
  return p?.k === "s" && typeof p.u === "string" && typeof p.v === "number" ? { userId: p.u, version: p.v } : null;
}

export async function startSession(userId: string, version: number) {
  const e = Date.now() + SESSION_DAYS * 86_400_000;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await seal({ k: "s", u: userId, v: version, e }), cookieOptions(new Date(e)));
  jar.set(SIGNUP_COOKIE, "", cookieOptions(new Date(0)));
}

export async function endSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", cookieOptions(new Date(0)));
  jar.set(SIGNUP_COOKIE, "", cookieOptions(new Date(0)));
}

/** the email verified by a code, waiting to finish signing up */
export async function readSignupTicket(): Promise<string | null> {
  const p = await open((await cookies()).get(SIGNUP_COOKIE)?.value);
  return p?.k === "t" && typeof p.m === "string" ? p.m : null;
}

export async function giveSignupTicket(email: string) {
  const e = Date.now() + SIGNUP_MINUTES * 60_000;
  (await cookies()).set(SIGNUP_COOKIE, await seal({ k: "t", m: email, e }), cookieOptions(new Date(e)));
}

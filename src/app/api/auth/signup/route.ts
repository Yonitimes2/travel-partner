import { randomBytes } from "node:crypto";
import { after } from "next/server";
import { allow, isFounder, jsonError, readJson } from "@/lib/server/auth";
import { db, type Row } from "@/lib/server/db";
import { sendQuietly } from "@/lib/server/email";
import { referrerEmail, signupEmail } from "@/lib/server/emails";
import { adminsOf, toUser, userByEmail, userById } from "@/lib/server/repo";
import { signUp } from "@/lib/server/schemas";
import { readSignupTicket, startSession } from "@/lib/server/session";
import { formatPhone, phoneDigits } from "@/lib/rules";

/**
 * Step 3: the profile and the recommendation, for an email just verified by a code.
 * The recommender must be an active member of the same section, found by phone. A section with no
 * members yet takes people without one; its admins check them. Everyone waits for the admins,
 * except the founders (ADMIN_EMAILS), who come in as admins of both sections.
 */
export async function POST(req: Request) {
  const email = await readSignupTicket();
  if (!email) return jsonError(401, "no_ticket");
  const parsed = signUp.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(400, "bad_request");
  const data = parsed.data;

  const q = await db();
  const existing = await userByEmail(q, email);
  if (existing) {
    await startSession(existing.id, existing.sessionVersion);
    return Response.json({ ok: true });
  }

  const founder = isFounder(email);
  let referrer = null;
  if (!founder) {
    if (!allow(`referral:${email}`, 10, 15)) return jsonError(429, "too_many");
    const [members] = await q.query<Row[]>("SELECT COUNT(*) AS n FROM users WHERE status = 'active' AND gender = ?", [data.gender]);
    const digits = phoneDigits(data.referral?.phone ?? "");
    if (digits) {
      const [rows] = await q.query<Row[]>(
        "SELECT * FROM users WHERE status = 'active' AND gender = ? AND phone = ? ORDER BY created_at LIMIT 1",
        [data.gender, digits],
      );
      referrer = rows[0] ? toUser(rows[0]) : null;
    }
    if (members[0].n > 0 && !referrer) return jsonError(400, data.referral ? "referral_not_found" : "referral_required");
  }

  const id = `u-${randomBytes(6).toString("hex")}`;
  const now = new Date();
  await q.query(
    `INSERT INTO users (id, email, gender, nickname, avatar, full_name, phone, party, age_group, observance, pace, city, about,
      status, referred_by, referral, history, notify, admin_of, lang, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, email, data.gender, data.nickname, data.avatar, data.fullName, phoneDigits(data.phone), JSON.stringify(data.party),
      data.ageGroup, data.observance, data.pace, data.city, data.about, founder ? "active" : "pending", referrer?.id ?? null,
      data.referral?.name ? JSON.stringify({ name: data.referral.name, phone: formatPhone(data.referral.phone) }) : null,
      JSON.stringify({ trips: 0, joined: 0 }), JSON.stringify({ push: true, email: true }), founder ? "male,female" : "",
      data.lang, now, now,
    ],
  );
  await startSession(id, 1);

  if (!founder) {
    const user = (await userById(q, id))!;
    const admins = await adminsOf(q, user.gender);
    after(async () => {
      if (referrer) await sendQuietly(referrerEmail(referrer, user));
      for (const admin of admins) await sendQuietly(signupEmail(admin, user, referrer));
    });
  }
  return Response.json({ ok: true });
}

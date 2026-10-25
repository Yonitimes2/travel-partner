import { allow, clientIp, isEmail, jsonError, newCode, normalizeEmail, readJson } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { sendEmail } from "@/lib/server/email";
import { codeEmail } from "@/lib/server/emails";
import { userByEmail } from "@/lib/server/repo";

/**
 * Step 1 of signing in or up: a 6-digit code to the email. The answer is the same whether or not
 * the email has an account, so nobody can find out who is a member.
 */
export async function POST(req: Request) {
  const body = await readJson(req);
  const email = normalizeEmail(String(body?.email ?? ""));
  if (!isEmail(email)) return jsonError(400, "bad_email");
  if (!allow(`code-ip:${clientIp(req)}`, 20, 60)) return jsonError(429, "too_many");

  const code = await newCode(email);
  if (!code) return jsonError(429, "too_many");
  const user = await userByEmail(await db(), email);
  try {
    await sendEmail(codeEmail(email, code, user?.lang ?? (body?.lang === "en" ? "en" : "he")));
  } catch (e) {
    console.error(`[email] sign-in code to ${email} failed:`, e);
    return jsonError(502, "email_failed");
  }
  return Response.json({ ok: true });
}

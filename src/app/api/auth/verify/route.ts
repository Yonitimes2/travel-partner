import { allow, checkCode, clientIp, isFounder, jsonError, normalizeEmail, readJson } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { userByEmail } from "@/lib/server/repo";
import { giveSignupTicket, startSession } from "@/lib/server/session";

/** Step 2: the code. A member is signed in; a new email gets a ticket to finish signing up. */
export async function POST(req: Request) {
  const body = await readJson(req);
  const email = normalizeEmail(String(body?.email ?? ""));
  const code = String(body?.code ?? "").replace(/\D/g, "");
  if (!email || code.length !== 6) return jsonError(400, "wrong_code");
  if (!allow(`verify-ip:${clientIp(req)}`, 30, 15)) return jsonError(429, "too_many");

  const result = await checkCode(email, code);
  if (result !== "ok") return jsonError(400, result === "wrong" ? "wrong_code" : "code_expired");

  const q = await db();
  const user = await userByEmail(q, email);
  if (!user) {
    await giveSignupTicket(email);
    return Response.json({ status: "new" });
  }
  // the founders (ADMIN_EMAILS) run both sections
  if (isFounder(email) && (user.adminOf.length < 2 || user.status !== "active")) {
    await q.query("UPDATE users SET admin_of = 'male,female', status = 'active', updated_at = ? WHERE id = ?", [new Date(), user.id]);
  }
  await startSession(user.id, user.sessionVersion);
  return Response.json({ status: "in" });
}

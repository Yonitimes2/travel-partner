import { readJson } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { userById } from "@/lib/server/repo";
import { startSession } from "@/lib/server/session";

/** development only: sign in as anyone, without a code (the strip at the top of the app in `next dev`) */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") return new Response(null, { status: 404 });
  const user = await userById(await db(), String((await readJson(req))?.userId ?? ""));
  if (!user) return Response.json({ error: "not_found" }, { status: 404 });
  await startSession(user.id, user.sessionVersion);
  return Response.json({ ok: true });
}

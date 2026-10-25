import { after } from "next/server";
import { ActionError, runAction } from "@/lib/server/actions";
import { currentUser, jsonError, readJson } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { sendQuietly } from "@/lib/server/email";
import { userById } from "@/lib/server/repo";
import { action } from "@/lib/server/schemas";
import { viewFor } from "@/lib/server/view";

/** one change by the signed-in person; answers with everything they may see after it */
export async function POST(req: Request) {
  const me = await currentUser();
  if (!me) return jsonError(401, "signed_out");
  const parsed = action.safeParse(await readJson(req));
  if (!parsed.success) return jsonError(400, "bad_request");

  try {
    const emails = await runAction(me, parsed.data);
    if (emails.some(Boolean)) {
      after(async () => {
        for (const email of emails) await sendQuietly(email);
      });
    }
  } catch (e) {
    if (e instanceof ActionError) return jsonError(e.status, e.code);
    throw e;
  }
  const fresh = (await userById(await db(), me.id)) ?? me;
  return Response.json(await viewFor(fresh), { headers: { "Cache-Control": "no-store" } });
}

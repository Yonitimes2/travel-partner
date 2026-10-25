import { currentUser, jsonError } from "@/lib/server/auth";
import { viewFor } from "@/lib/server/view";

/** everything the signed-in person may see (the app asks again every few seconds) */
export async function GET() {
  const me = await currentUser();
  if (!me) return jsonError(401, "signed_out");
  return Response.json(await viewFor(me), { headers: { "Cache-Control": "no-store" } });
}

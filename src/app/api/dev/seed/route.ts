import { startSession } from "@/lib/server/session";
import { fillSampleData } from "@/lib/server/sample";
import { DEMO_MAN } from "@/lib/seed";

/** development only: empties the database, fills it with the sample data, and signs in as the sample man */
export async function POST() {
  if (process.env.NODE_ENV === "production") return new Response(null, { status: 404 });
  await fillSampleData();
  await startSession(DEMO_MAN, 1);
  return Response.json({ ok: true });
}

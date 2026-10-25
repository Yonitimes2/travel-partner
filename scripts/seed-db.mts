/**
 * Empties a database and fills it with the sample data (the same as the development strip's button).
 *   npm run db:seed              the development database (DATABASE_URL in .env.local)
 *   npm run db:seed -- --server  the server's database (DATABASE_URL_SERVER, through `npm run db:tunnel`)
 * The tables are created by the app's own migrations (src/lib/server/db.ts) on first use.
 */
process.loadEnvFile(".env.local");
if (process.argv.includes("--server")) {
  if (!process.env.DATABASE_URL_SERVER) throw new Error("DATABASE_URL_SERVER is missing from .env.local");
  process.env.DATABASE_URL = process.env.DATABASE_URL_SERVER;
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing from .env.local");

const { fillSampleData } = await import("../src/lib/server/sample");
const { closeDb } = await import("../src/lib/server/db");
try {
  const n = await fillSampleData();
  console.log(`seeded ${new URL(process.env.DATABASE_URL).pathname.slice(1)}: ${n.users} users, ${n.trips} trips, ${n.requests} requests, ${n.messages} messages`);
} finally {
  await closeDb();
}

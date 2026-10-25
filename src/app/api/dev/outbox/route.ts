import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { outboxDir } from "@/lib/server/email";

/** development only: the emails that would have been sent (newest first); ?f=<file> shows one */
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") return new Response(null, { status: 404 });
  const dir = outboxDir();
  const files = (await readdir(/*turbopackIgnore: true*/ dir).catch(() => [] as string[])).filter((f) => f.endsWith(".json")).sort().reverse();
  const html = (body: string) => new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

  const pick = new URL(req.url).searchParams.get("f");
  if (pick) {
    if (!files.includes(pick)) return new Response(null, { status: 404 });
    return html(JSON.parse(await readFile(/*turbopackIgnore: true*/ path.join(dir, pick), "utf8")).html);
  }

  const rows = await Promise.all(
    files.slice(0, 50).map(async (f) => {
      const e = JSON.parse(await readFile(/*turbopackIgnore: true*/ path.join(dir, f), "utf8"));
      return `<li><a href="?f=${encodeURIComponent(f)}">${esc(e.subject)}</a><br><small>${esc(e.to)} · ${esc(e.at)}</small></li>`;
    }),
  );
  return html(
    `<!doctype html><meta charset="utf-8"><title>Outbox</title><body style="font-family:system-ui;padding:16px" dir="rtl"><h1>מיילים (פיתוח)</h1><ol style="line-height:1.6">${rows.join("") || "<p>אין עדיין</p>"}</ol></body>`,
  );
}

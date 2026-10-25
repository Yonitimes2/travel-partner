import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { dataDir } from "./keys";

/**
 * Sending email through Resend (https://resend.com/docs/api-reference/emails/send-email).
 * Without RESEND_API_KEY, or with EMAIL_MODE=log (development), nothing is sent: each email is
 * printed and saved to <data dir>/outbox, where /api/dev/outbox shows it.
 */

export interface Email {
  to: string;
  subject: string;
  html: string;
  text: string;
}

const FROM = () => process.env.EMAIL_FROM || "שותף לדרך <no-reply@trip.systemsapp.tech>";

export const outboxDir = () => path.join(/*turbopackIgnore: true*/ dataDir(), "outbox");

export async function sendEmail(email: Email): Promise<void> {
  if (!process.env.RESEND_API_KEY || process.env.EMAIL_MODE === "log") {
    console.log(`[email] to ${email.to}: ${email.subject}\n${email.text}\n`);
    await mkdir(outboxDir(), { recursive: true, mode: 0o700 });
    const file = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.json`;
    await writeFile(path.join(/*turbopackIgnore: true*/ outboxDir(), file), JSON.stringify({ ...email, at: new Date().toISOString() }), { mode: 0o600 });
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM(), to: [email.to], subject: email.subject, html: email.html, text: email.text }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Resend answered ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

/** for emails sent after the response: a failure is logged, never shown to the person who acted */
export function sendQuietly(email: Email | null | undefined): Promise<void> {
  if (!email) return Promise.resolve();
  return sendEmail(email).catch((e) => console.error(`[email] to ${email.to} failed:`, e));
}

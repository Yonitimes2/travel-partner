import type { Lang, Trip } from "./types";

/** dates are kept as local calendar days, "yyyy-mm-dd" */

const pad = (n: number) => String(n).padStart(2, "0");

export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const todayISO = () => toISO(new Date());

export const addDays = (iso: string, days: number) => {
  const d = fromISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
};

export const daysBetween = (from: string, to: string) =>
  Math.round((fromISO(to).getTime() - fromISO(from).getTime()) / 86_400_000);

/** the last day someone can ask to join */
export const deadlineOf = (trip: Trip) =>
  trip.deadline.type === "date" ? trip.deadline.date : addDays(trip.startDate, -trip.deadline.days);

export const isOpen = (trip: Trip, today: string) => deadlineOf(trip) >= today && trip.startDate >= today;

const locale = (lang: Lang) => (lang === "he" ? "he-IL" : "en-GB");

export const formatDay = (iso: string, lang: Lang) =>
  new Intl.DateTimeFormat(locale(lang), { day: "numeric", month: "short" }).format(fromISO(iso));

export const formatRange = (start: string, end: string, lang: Lang) => {
  const fmt = new Intl.DateTimeFormat(locale(lang), { day: "numeric", month: "short" });
  return start === end ? fmt.format(fromISO(start)) : fmt.formatRange(fromISO(start), fromISO(end));
};

export const formatTime = (at: string, lang: Lang) =>
  new Intl.DateTimeFormat(locale(lang), { hour: "2-digit", minute: "2-digit" }).format(new Date(at));

export const monthKey = (iso: string) => iso.slice(0, 7);

export const formatMonth = (key: string, lang: Lang) =>
  new Intl.DateTimeFormat(locale(lang), { month: "long", year: "numeric" }).format(fromISO(`${key}-01`));

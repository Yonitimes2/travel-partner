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

/** a planned trip's date options; closed trips (and fixed dates) have none */
export const flexOf = (trip: Pick<Trip, "kind" | "flex">) =>
  trip.kind === "planned" && trip.flex && trip.flex.type !== "fixed" ? trip.flex : undefined;

/** the second option's return date keeps the trip's length */
export const altEndDate = (trip: Pick<Trip, "startDate" | "endDate">, altStart: string) =>
  addDays(altStart, daysBetween(trip.startDate, trip.endDate));

/** the earliest the trip might leave, counting its date options */
export const earliestStart = (trip: Trip) => {
  const flex = flexOf(trip);
  if (flex?.type === "alt") return flex.startDate < trip.startDate ? flex.startDate : trip.startDate;
  if (flex?.type === "range") return addDays(trip.startDate, -flex.days);
  return trip.startDate;
};

/** the last day someone can ask to join ("N days before" counts from the earliest option) */
export const deadlineOf = (trip: Trip) =>
  trip.deadline.type === "date" ? trip.deadline.date : addDays(earliestStart(trip), -trip.deadline.days);

/** still taking requests: not marked "found partners", and the deadline and departure haven't passed */
export const isOpen = (trip: Trip, today: string) =>
  trip.status === "open" && deadlineOf(trip) >= today && trip.startDate >= today;

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

/** the months a trip could leave in (a second date may fall in another month) */
export const monthsOf = (trip: Trip) => {
  const flex = flexOf(trip);
  const keys = [monthKey(trip.startDate)];
  if (flex?.type === "alt") keys.push(monthKey(flex.startDate));
  return keys;
};

export type DurationUnit = "days" | "weeks" | "months";

/**
 * How a number of days reads: up to two weeks in days, up to a month in weeks and days,
 * beyond that in months and weeks (a month counts as 30 days; 4 leftover weeks round up to a month).
 */
export function durationParts(days: number): { unit: DurationUnit; n: number }[] {
  const d = Math.max(0, Math.round(days));
  if (d <= 14) return [{ unit: "days", n: d }];
  if (d <= 30) {
    const parts: { unit: DurationUnit; n: number }[] = [{ unit: "weeks", n: Math.floor(d / 7) }];
    if (d % 7) parts.push({ unit: "days", n: d % 7 });
    return parts;
  }
  let months = Math.floor(d / 30);
  let weeks = Math.floor((d % 30) / 7);
  if (weeks >= 4) {
    months += 1;
    weeks = 0;
  }
  const parts: { unit: DurationUnit; n: number }[] = [{ unit: "months", n: months }];
  if (weeks) parts.push({ unit: "weeks", n: weeks });
  return parts;
}

export const formatMonth = (key: string, lang: Lang) =>
  new Intl.DateTimeFormat(locale(lang), { month: "long", year: "numeric" }).format(fromISO(`${key}-01`));

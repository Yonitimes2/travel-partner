import { isOpen } from "./dates";
import type { Block, JoinRequest, Party, Stats, Trip, User } from "./types";

/** the price of a closed trip (accepting partners); free while the beta lasts */
export const TRIP_FEE = "₪79";
export const BETA = true;

/** active planned trips one person can have at a time */
export const PLANNED_LIMIT = 2;

export const isBlocked = (blocks: Block[], a: string, b: string) =>
  blocks.some((x) => (x.by === a && x.who === b) || (x.by === b && x.who === a));

/**
 * Who sees a trip: people of the owner's gender, and everyone when the trip is looking for families.
 * Owners always see their own trips; suspended, pending and blocked people are left out.
 */
export function canSee(trip: Trip, owner: User, me: User, blocks: Block[]) {
  if (trip.ownerId === me.id) return true;
  if (owner.status !== "active" || isBlocked(blocks, me.id, owner.id)) return false;
  return owner.gender === me.gender || trip.wanted === "families";
}

/** how many people a party is (with others but no number given counts as two) */
export const partySize = (p: Party) =>
  p.type === "solo" ? 1 : p.type === "group" ? 1 + Math.max(1, p.others) : p.parents + p.kids;

/** a phone number as it's kept: digits only, Israeli form ("050…", also from "+972 50…") */
export const phoneDigits = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("972") ? `0${d.slice(3)}` : d.length === 9 && d.startsWith("5") ? `0${d}` : d;
};

/** phone numbers compared by their digits only */
export const samePhone = (a: string, b: string) => a.replace(/\D/g, "") === b.replace(/\D/g, "");

export const formatPhone = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3)}` : phone;
};

/** points come from activity only: trips that people joined, and how many joined (counted on the server) */
export function statsOf(user: Pick<User, "id" | "history">, trips: Pick<Trip, "id" | "ownerId">[], requests: JoinRequest[]): Stats {
  const mine = new Set(trips.filter((t) => t.ownerId === user.id).map((t) => t.id));
  const accepted = requests.filter((r) => r.status === "accepted" && mine.has(r.tripId));
  const tripCount = user.history.trips + new Set(accepted.map((r) => r.tripId)).size;
  const joined = user.history.joined + accepted.reduce((n, r) => n + partySize(r.party), 0);
  return { trips: tripCount, joined, points: tripCount * 10 + joined * 5 };
}

export type Tier = "bronze" | "silver" | "gold";
export const tierOf = (points: number): Tier => (points >= 150 ? "gold" : points >= 50 ? "silver" : "bronze");

export const activePlanned = (trips: Trip[], userId: string, today: string) =>
  trips.filter((t) => t.ownerId === userId && t.kind === "planned" && isOpen(t, today)).length;

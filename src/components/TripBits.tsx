"use client";

import Link from "next/link";
import { BadgeCheck, CalendarDays, Hourglass, Lightbulb, MapPin, Users } from "lucide-react";
import { Avatar } from "./Avatar";
import { useT } from "./Providers";
import { daysBetween, deadlineOf, formatDay, formatRange } from "@/lib/dates";
import type { Trip, TripKind, User } from "@/lib/types";

export function KindBadge({ kind }: { kind: TripKind }) {
  const { t } = useT();
  return kind === "booked" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">
      <BadgeCheck size={14} aria-hidden />
      {t.kind.booked}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-plan-soft px-2.5 py-1 text-xs font-semibold text-plan">
      <Lightbulb size={14} aria-hidden />
      {t.kind.planned}
    </span>
  );
}

export function StyleChips({ trip, max }: { trip: Trip; max?: number }) {
  const { t } = useT();
  const styles = max ? trip.styles.slice(0, max) : trip.styles;
  return (
    <div className="flex flex-wrap gap-1.5">
      {styles.map((s) => (
        <span key={s} className="rounded-full bg-cream px-2.5 py-1 text-xs text-muted ring-1 ring-line">
          {t.style[s]}
        </span>
      ))}
    </div>
  );
}

/** "12–19 Nov · 8 days" */
export function TripDates({ trip }: { trip: Trip }) {
  const { t, lang } = useT();
  return (
    <span className="inline-flex items-center gap-1.5">
      <CalendarDays size={16} className="text-muted" aria-hidden />
      <span>
        {formatRange(trip.startDate, trip.endDate, lang)}
        <span className="text-muted"> · {t.trip.days(daysBetween(trip.startDate, trip.endDate) + 1)}</span>
      </span>
    </span>
  );
}

/** "Open to join until 2 Nov · 8 days left" */
export function DeadlineLine({ trip, today }: { trip: Trip; today: string }) {
  const { t, lang } = useT();
  const last = deadlineOf(trip);
  const left = daysBetween(today, last);
  return (
    <span className="inline-flex items-center gap-1.5">
      <Hourglass size={15} className="text-muted" aria-hidden />
      <span>
        {t.trip.openUntil(formatDay(last, lang))}
        <span className={left <= 3 ? "font-medium text-coral" : "text-muted"}> · {t.trip.closesIn(left)}</span>
      </span>
    </span>
  );
}

export function TripCard({ trip, owner, today }: { trip: Trip; owner: User; today: string }) {
  const { t, href } = useT();
  return (
    <Link
      href={href(`/trips/${trip.id}`)}
      className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line transition hover:shadow-md hover:ring-brand/30"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <Avatar id={owner.avatar} size={34} />
          <span className="truncate text-sm">
            <span className="font-medium text-ink">{owner.nickname}</span>
            <span className="text-muted"> · {owner.city}</span>
          </span>
        </span>
        <KindBadge kind={trip.kind} />
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-snug text-ink">{trip.place}</h3>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink">
        <TripDates trip={trip} />
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={16} className="text-muted" aria-hidden />
          {t.area[trip.area]}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users size={16} className="text-muted" aria-hidden />
          {t.wanted[owner.gender][trip.wanted]}
        </span>
      </div>

      <div className="mt-3">
        <StyleChips trip={trip} max={3} />
      </div>

      <div className="mt-3 border-t border-line pt-3 text-xs text-ink">
        <DeadlineLine trip={trip} today={today} />
      </div>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { BadgeCheck, Hourglass, Lightbulb, Plane, Users } from "lucide-react";
import { Avatar } from "./Avatar";
import { Photo } from "./Photo";
import { PointsPill } from "./ui";
import { useT } from "./Providers";
import { altEndDate, daysBetween, deadlineOf, flexOf, formatDay } from "@/lib/dates";
import type { Trip, TripKind, User } from "@/lib/types";

export function KindBadge({ kind, onDark = false }: { kind: TripKind; onDark?: boolean }) {
  const { t } = useT();
  return kind === "closed" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2.5 py-1 text-xs font-bold text-white shadow-sm">
      <BadgeCheck size={14} aria-hidden />
      {t.kind.closed}
    </span>
  ) : (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
        onDark ? "glass text-white" : "bg-sky-soft text-sky"
      }`}
    >
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
        <span key={s} className="rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-muted">
          {t.style[s]}
        </span>
      ))}
    </div>
  );
}

/** depart ✈ return, the way a boarding pass shows it; a planned trip's other date or range shows under each date */
export function FlightLine({ trip }: { trip: Pick<Trip, "startDate" | "endDate" | "kind" | "flex"> }) {
  const { t, lang } = useT();
  const days = daysBetween(trip.startDate, trip.endDate) + 1;
  const flex = flexOf(trip);
  const option = (date: string) =>
    flex?.type === "alt" ? t.trip.or(formatDay(date, lang)) : flex?.type === "range" ? t.trip.plusMinus(flex.days) : null;
  const altStart = flex?.type === "alt" ? flex.startDate : trip.startDate;

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <div>
        <div className="text-[11px] font-medium text-muted">{t.trip.depart}</div>
        <div className="whitespace-nowrap text-lg font-bold text-ink">{formatDay(trip.startDate, lang)}</div>
        {flex && <div className="whitespace-nowrap text-xs font-semibold text-sky">{option(altStart)}</div>}
      </div>
      <div className="flex min-w-14 flex-col items-center text-sky">
        <div className="flex w-full items-center gap-1">
          <span className="h-px flex-1 border-t-2 border-dotted border-sky/40" />
          <Plane size={18} className="rotate-45 rtl:-rotate-[135deg]" aria-hidden />
          <span className="h-px flex-1 border-t-2 border-dotted border-sky/40" />
        </div>
        <span className="mt-0.5 whitespace-nowrap text-[11px] font-semibold text-muted">{t.duration(days)}</span>
        {flex && (
          <span className="mt-1 whitespace-nowrap rounded-full bg-sky-soft px-2 py-0.5 text-[10px] font-bold text-sky">
            {flex.type === "alt" ? t.trip.notFinal : t.trip.flexible}
          </span>
        )}
      </div>
      <div className="text-end">
        <div className="text-[11px] font-medium text-muted">{t.trip.return}</div>
        <div className="whitespace-nowrap text-lg font-bold text-ink">{formatDay(trip.endDate, lang)}</div>
        {flex && <div className="whitespace-nowrap text-xs font-semibold text-sky">{option(altEndDate(trip, altStart))}</div>}
      </div>
    </div>
  );
}

/** "8 days left", for the corner of the art */
export function ClosesChip({ trip, today }: { trip: Trip; today: string }) {
  const { t } = useT();
  const left = daysBetween(today, deadlineOf(trip));
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${left <= 3 ? "bg-coral text-white" : "glass text-white"}`}>
      <Hourglass size={13} aria-hidden />
      {t.trip.closesIn(left)}
    </span>
  );
}

export function TripCard({ trip, owner, today, points }: { trip: Trip; owner: User; today: string; points: number }) {
  const { t, href } = useT();
  return (
    <Link
      href={href(`/trips/${trip.id}`)}
      className="block overflow-hidden rounded-3xl bg-white shadow-[0_10px_30px_-14px_rgba(11,29,77,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-14px_rgba(11,29,77,0.45)]"
    >
      <div className="relative h-36">
        <Photo area={trip.area} photo={trip.photo} seed={trip.id} sizes="(max-width: 448px) 92vw, 416px" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent" />
        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          <KindBadge kind={trip.kind} onDark />
          <ClosesChip trip={trip} today={today} />
        </div>
        <div className="absolute inset-x-4 bottom-3 text-white">
          <div className="text-xs font-medium opacity-80">{t.area[trip.area]}</div>
          <h3 className="text-xl font-bold leading-tight">{trip.place}</h3>
        </div>
      </div>

      <div className="px-4 pb-3 pt-3">
        <FlightLine trip={trip} />
      </div>

      <div className="perforation" />

      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <span className="flex min-w-0 items-center gap-2">
          <Avatar id={owner.avatar} size={30} />
          <span className="truncate text-sm font-semibold text-ink">{owner.nickname}</span>
          <PointsPill points={points} compact />
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-navy">
          <Users size={15} aria-hidden />
          {t.wanted[owner.gender][trip.wanted]}
        </span>
      </div>
    </Link>
  );
}

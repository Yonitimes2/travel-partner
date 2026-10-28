"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { ChevronDown, Globe2 } from "lucide-react";
import { Brand } from "./Logo";
import { Photo } from "./Photo";
import { TripCard } from "./TripBits";
import { LangToggle, PointsPill, SegTabs } from "./ui";
import { useT } from "./Providers";
import { formatMonth, isOpen, monthsOf, todayISO } from "@/lib/dates";
import { FULL_WIDTH, PHOTOS, heroOfDay, photosOf } from "@/lib/photos";
import { canSee } from "@/lib/rules";
import { findUser, useApp } from "@/lib/store";
import type { Area, PhotoId, TripKind, Wanted } from "@/lib/types";

export const AREAS: Area[] = ["north", "center", "jerusalem", "south", "europe", "usa", "asia", "other"];
const WANTED: Wanted[] = ["one", "few", "families"];
const noSubscribe = () => () => {};
const currentHour = () => new Date().getHours();

/**
 * The top of the home screen: today's destination photo, the greeting and the headline. It doesn't wait
 * for the data (the greeting fills in when it comes), and the photo is already downloading: the page's
 * <head> asked for it.
 */
export function HomeHero() {
  const { t, href } = useT();
  const { users, meId, feed } = useApp();
  const me = findUser(users, meId);
  // the day comes from the browser's clock, so the server leaves the photo out and the browser adds it at once
  const today = useSyncExternalStore(noSubscribe, todayISO, () => "");
  // so does the hour; the greeting only shows once the person is known, which is in the browser too
  const hour = useSyncExternalStore(noSubscribe, currentHour, () => 12);
  const greeting = hour < 12 ? t.greeting.morning : hour < 17 ? t.greeting.noon : t.greeting.evening;
  // the chosen area's photo, or one of the brightest destinations, a different one each day
  const heroPhoto: PhotoId | null = feed.area ? photosOf(feed.area)[0] : today ? heroOfDay(today) : null;

  return (
    <section className="relative h-[290px] overflow-hidden bg-navy text-white">
      {heroPhoto && <Photo area={PHOTOS[heroPhoto].area} photo={heroPhoto} sizes={FULL_WIDTH} preload />}
      <div className="absolute inset-0 bg-gradient-to-b from-navy/50 via-transparent to-navy/80" />
      <div className="relative flex h-full flex-col px-4 pb-10 pt-4">
        <div className="flex items-center justify-between gap-2">
          <Link href={href("/")}>
            <Brand />
          </Link>
          <div className="flex items-center gap-2">
            {me && (
              <Link href={href("/profile")}>
                <PointsPill points={me.stats.points} onDark />
              </Link>
            )}
            <LangToggle />
          </div>
        </div>
        <div className="mt-auto">
          <p className="h-5 text-sm font-medium opacity-85">{me && greeting(me.nickname)}</p>
          <h1 className="mt-1 text-[32px] font-extrabold leading-[1.1] tracking-tight">{t.home.headline}</h1>
          <span className={`glass mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${me ? "" : "invisible"}`}>
            {me ? t.section[me.gender] : "·"}
          </span>
        </div>
      </div>
    </section>
  );
}

export function Feed() {
  const { t, lang } = useT();
  const { users, trips, blocks, meId, today, feed, setFeed } = useApp();
  const me = findUser(users, meId)!;

  // the viewer's section: same-gender trips plus family trips from both sections, still open
  const section = useMemo(
    () =>
      trips
        .filter((tr) => {
          const owner = findUser(users, tr.ownerId);
          return tr.ownerId !== meId && owner && canSee(tr, owner, me, blocks) && isOpen(tr, today);
        })
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [trips, users, meId, me, blocks, today],
  );

  const ofKind = section.filter((tr) => tr.kind === feed.kind);
  const months = [...new Set(ofKind.flatMap(monthsOf))].sort();
  const shown = ofKind.filter(
    (tr) =>
      (!feed.area || tr.area === feed.area) &&
      (!feed.wanted || tr.wanted === feed.wanted) &&
      (!feed.month || monthsOf(tr).includes(feed.month)),
  );
  const filtered = Boolean(feed.area || feed.wanted || feed.month);
  const countOf = (kind: TripKind) => section.filter((tr) => tr.kind === kind).length;
  // points are counted by the server, from everyone's requests (the app only sees its own)
  const pointsOf = (userId: string) => findUser(users, userId)?.stats.points ?? 0;

  return (
    <div>
      <div className="relative -mt-6 rounded-t-[28px] bg-mist px-4 pt-5">
        <SegTabs
          value={feed.kind}
          onChange={(kind) => setFeed({ kind, month: "" })}
          options={(["closed", "planned"] as const).map((kind) => ({
            key: kind,
            label: (
              <>
                {t.kindTab[kind]} <span className="font-normal opacity-70">({countOf(kind)})</span>
              </>
            ),
          }))}
        />
        <p className="mt-2 px-1 text-sm text-muted">{t.kindHint[feed.kind]}</p>

        {/* areas as round destination buttons */}
        <div className="no-scrollbar -mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-1">
          <AreaButton label={t.home.all} selected={!feed.area} onClick={() => setFeed({ area: "" })}>
            <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-2 to-navy text-white">
              <Globe2 size={24} aria-hidden />
            </span>
          </AreaButton>
          {AREAS.map((a) => (
            <AreaButton key={a} label={t.area[a]} selected={feed.area === a} onClick={() => setFeed({ area: feed.area === a ? "" : a })}>
              <Photo area={a} sizes="64px" />
            </AreaButton>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <FilterSelect
            label={t.feed.wanted}
            value={feed.wanted}
            onChange={(v) => setFeed({ wanted: v as Wanted | "" })}
            options={[["", `${t.feed.wanted}: ${t.feed.anyWanted}`], ...WANTED.map((w) => [w, t.wanted[me.gender][w]] as [string, string])]}
          />
          <FilterSelect
            label={t.feed.month}
            value={feed.month}
            onChange={(v) => setFeed({ month: v })}
            options={[["", t.feed.anyMonth], ...months.map((m) => [m, formatMonth(m, lang)] as [string, string])]}
          />
        </div>

        <div className="mt-4 flex items-center justify-between px-1 text-sm">
          <span className="font-semibold text-ink">{t.feed.count(shown.length)}</span>
          {filtered && (
            <button type="button" onClick={() => setFeed({ area: "", wanted: "", month: "" })} className="font-semibold text-sky">
              {t.feed.clear}
            </button>
          )}
        </div>

        <div className="mt-3 space-y-4">
          {shown.map((tr) => (
            <TripCard key={tr.id} trip={tr} owner={findUser(users, tr.ownerId)!} today={today} points={pointsOf(tr.ownerId)} />
          ))}
          {shown.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-line px-4 py-10 text-center text-sm text-muted">{t.feed.empty}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function AreaButton({
  label,
  selected,
  onClick,
  children,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className="flex w-16 shrink-0 flex-col items-center gap-1.5">
      <span
        className={`relative block h-16 w-16 overflow-hidden rounded-full ring-offset-2 ring-offset-mist transition ${
          selected ? "ring-[3px] ring-sky" : "ring-1 ring-line"
        }`}
      >
        {children}
      </span>
      <span className={`w-full truncate text-center text-xs ${selected ? "font-bold text-navy" : "font-medium text-muted"}`}>{label}</span>
    </button>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <label
      className={`relative flex min-w-0 flex-1 items-center rounded-2xl ring-1 transition ${
        value ? "bg-sky-soft text-navy ring-sky/40" : "bg-white text-ink ring-line"
      }`}
    >
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 appearance-none truncate bg-transparent py-2.5 ps-3.5 pe-8 text-sm font-semibold outline-none"
      >
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute end-3" aria-hidden />
    </label>
  );
}

"use client";

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { TripCard } from "./TripBits";
import { useT } from "./Providers";
import { formatMonth, isOpen, monthKey } from "@/lib/dates";
import { findUser, useApp } from "@/lib/store";
import type { Area, TripKind, Wanted } from "@/lib/types";

const AREAS: Area[] = ["north", "center", "jerusalem", "south", "europe", "usa", "asia", "other"];
const WANTED: Wanted[] = ["one", "few", "families"];

export function Feed() {
  const { t, lang } = useT();
  const { users, trips, meId, today, feed, setFeed } = useApp();
  const me = findUser(users, meId)!;

  // only the viewer's own section: trips posted by people of the same gender, still open to join
  const section = useMemo(
    () =>
      trips
        .filter((tr) => tr.ownerId !== meId && findUser(users, tr.ownerId)?.gender === me.gender && isOpen(tr, today))
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [trips, users, meId, me.gender, today],
  );

  const ofKind = section.filter((tr) => tr.kind === feed.kind);
  const months = [...new Set(ofKind.map((tr) => monthKey(tr.startDate)))].sort();
  const shown = ofKind.filter(
    (tr) =>
      (!feed.area || tr.area === feed.area) &&
      (!feed.wanted || tr.wanted === feed.wanted) &&
      (!feed.month || monthKey(tr.startDate) === feed.month),
  );
  const filtered = Boolean(feed.area || feed.wanted || feed.month);
  const countOf = (kind: TripKind) => section.filter((tr) => tr.kind === kind).length;

  return (
    <div>
      <div role="tablist" className="grid grid-cols-2 gap-1 rounded-2xl bg-white p-1 ring-1 ring-line">
        {(["booked", "planned"] as const).map((kind) => (
          <button
            key={kind}
            role="tab"
            type="button"
            aria-selected={feed.kind === kind}
            onClick={() => setFeed({ kind, month: "" })}
            className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              feed.kind === kind ? (kind === "booked" ? "bg-brand text-white" : "bg-plan-soft text-plan") : "text-muted hover:text-ink"
            }`}
          >
            {t.kindTab[kind]} <span className="font-normal opacity-75">({countOf(kind)})</span>
          </button>
        ))}
      </div>
      <p className="mt-2 px-1 text-sm text-muted">{t.kindHint[feed.kind]}</p>

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <FilterSelect
          label={t.feed.area}
          value={feed.area}
          onChange={(v) => setFeed({ area: v as Area | "" })}
          options={[["", t.feed.allAreas], ...AREAS.map((a) => [a, t.area[a]] as [string, string])]}
        />
        <FilterSelect
          label={t.feed.wanted}
          value={feed.wanted}
          onChange={(v) => setFeed({ wanted: v as Wanted | "" })}
          options={[["", t.feed.anyWanted], ...WANTED.map((w) => [w, t.wanted[me.gender][w]] as [string, string])]}
        />
        <FilterSelect
          label={t.feed.month}
          value={feed.month}
          onChange={(v) => setFeed({ month: v })}
          options={[["", t.feed.anyMonth], ...months.map((m) => [m, formatMonth(m, lang)] as [string, string])]}
        />
      </div>

      <div className="mt-3 flex items-center justify-between px-1 text-sm">
        <span className="text-muted">{t.feed.count(shown.length)}</span>
        {filtered && (
          <button type="button" onClick={() => setFeed({ area: "", wanted: "", month: "" })} className="font-medium text-brand">
            {t.feed.clear}
          </button>
        )}
      </div>

      <div className="mt-2 space-y-3">
        {shown.map((tr) => (
          <TripCard key={tr.id} trip={tr} owner={findUser(users, tr.ownerId)!} today={today} />
        ))}
        {shown.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line bg-white/60 px-4 py-10 text-center text-sm text-muted">
            {t.feed.empty}
          </div>
        )}
      </div>
    </div>
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
      className={`relative flex shrink-0 items-center rounded-full ring-1 transition ${
        value ? "bg-brand-soft text-brand-strong ring-brand/40" : "bg-white text-ink ring-line"
      }`}
    >
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent py-2 ps-3.5 pe-8 text-sm font-medium outline-none"
      >
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute end-2.5" aria-hidden />
    </label>
  );
}

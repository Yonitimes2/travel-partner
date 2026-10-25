"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BadgeCheck, CreditCard, FlaskConical, Lightbulb } from "lucide-react";
import { KindBadge } from "./TripBits";
import { useT, useToast } from "./Providers";
import { BOOKED_FEE } from "@/lib/i18n";
import { addDays, daysBetween, formatRange } from "@/lib/dates";
import { findUser, useApp, type NewTrip } from "@/lib/store";
import type { Area, Deadline, TripKind, TripStyle, Wanted } from "@/lib/types";

const AREAS: Area[] = ["north", "center", "jerusalem", "south", "europe", "usa", "asia", "other"];
const WANTED: Wanted[] = ["one", "few", "families"];
const STYLES: TripStyle[] = ["hiking", "nature", "cities", "relaxed", "adventure", "shabbat", "food"];

type Errors = Partial<Record<"place" | "area" | "dates" | "deadline", string>>;

const field =
  "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export function NewTripForm() {
  const { t, lang, href } = useT();
  const toast = useToast();
  const router = useRouter();
  const { users, meId, today, createTrip } = useApp();
  const me = findUser(users, meId)!;

  const [kind, setKind] = useState<TripKind>("planned");
  const [place, setPlace] = useState("");
  const [area, setArea] = useState<Area | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [wanted, setWanted] = useState<Wanted>("few");
  const [styles, setStyles] = useState<TripStyle[]>([]);
  const [description, setDescription] = useState("");
  const [deadlineType, setDeadlineType] = useState<Deadline["type"]>("daysBefore");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [daysBefore, setDaysBefore] = useState(7);
  const [errors, setErrors] = useState<Errors>({});
  const [paying, setPaying] = useState<NewTrip | null>(null);

  const toggleStyle = (s: TripStyle) =>
    setStyles((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const validate = (): NewTrip | null => {
    const e: Errors = {};
    if (!place.trim()) e.place = t.newTrip.errors.place;
    if (!area) e.area = t.newTrip.errors.area;
    if (!startDate || !endDate) e.dates = t.newTrip.errors.dates;
    else if (endDate < startDate) e.dates = t.newTrip.errors.order;
    else if (startDate < today) e.dates = t.newTrip.errors.past;

    const deadline: Deadline =
      deadlineType === "date" ? { type: "date", date: deadlineDate } : { type: "daysBefore", days: daysBefore };
    if (!e.dates) {
      const last = deadline.type === "date" ? deadline.date : addDays(startDate, -deadline.days);
      if (!last || last < today || last > startDate) e.deadline = t.newTrip.errors.deadline;
    }

    setErrors(e);
    if (Object.keys(e).length > 0) {
      // bring the first message into view (the form is longer than a phone screen)
      requestAnimationFrame(() => document.querySelector("[data-error]")?.scrollIntoView({ block: "center", behavior: "smooth" }));
      return null;
    }
    return { kind, place: place.trim(), area: area as Area, startDate, endDate, wanted, styles, description: description.trim(), deadline };
  };

  const publish = (trip: NewTrip) => {
    const id = createTrip(trip);
    toast(t.newTrip.published);
    router.push(href(`/trips/${id}`));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trip = validate();
    if (!trip) return;
    if (trip.kind === "booked") setPaying(trip);
    else publish(trip);
  };

  if (paying) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-ink">{t.payment.title}</h1>
        <section className="rounded-2xl bg-white p-4 ring-1 ring-line">
          <KindBadge kind="booked" />
          <div className="mt-2 text-lg font-semibold text-ink">{paying.place}</div>
          <div className="text-sm text-muted">{formatRange(paying.startDate, paying.endDate, lang)}</div>
          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-sm text-muted">{t.payment.once}</span>
            <span className="ms-3 text-3xl font-bold text-ink">{BOOKED_FEE}</span>
          </div>
        </section>
        <p className="flex items-start gap-2 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
          <FlaskConical size={16} className="mt-0.5 shrink-0" aria-hidden />
          {t.payment.demo}
        </p>
        <button
          type="button"
          onClick={() => publish(paying)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-base font-semibold text-white hover:bg-brand-strong"
        >
          <CreditCard size={18} aria-hidden />
          {t.payment.pay(BOOKED_FEE)}
        </button>
        <button type="button" onClick={() => setPaying(null)} className="w-full py-2 text-sm font-medium text-muted">
          {t.payment.back}
        </button>
      </div>
    );
  }

  const tripDays = startDate && endDate && endDate >= startDate ? daysBetween(startDate, endDate) + 1 : 0;

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t.newTrip.title}</h1>
        <p className="mt-1 text-sm text-muted">{t.newTrip.postedIn(t.postedIn[me.gender])}</p>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">{t.newTrip.kindQuestion}</legend>
        <div className="grid grid-cols-2 gap-2">
          <KindOption
            selected={kind === "planned"}
            onSelect={() => setKind("planned")}
            icon={<Lightbulb size={20} aria-hidden />}
            title={t.newTrip.plannedTitle}
            desc={t.newTrip.plannedDesc}
            price={t.newTrip.plannedPrice}
            tone="plan"
          />
          <KindOption
            selected={kind === "booked"}
            onSelect={() => setKind("booked")}
            icon={<BadgeCheck size={20} aria-hidden />}
            title={t.newTrip.bookedTitle}
            desc={t.newTrip.bookedDesc}
            price={t.newTrip.bookedPrice(BOOKED_FEE)}
            tone="brand"
          />
        </div>
      </fieldset>

      <div className="space-y-3">
        <Field label={t.newTrip.place} error={errors.place} htmlFor="place">
          <input id="place" value={place} onChange={(e) => setPlace(e.target.value)} placeholder={t.newTrip.placePlaceholder} className={field} />
        </Field>
        <Field label={t.newTrip.area} error={errors.area} htmlFor="area">
          <select id="area" value={area} onChange={(e) => setArea(e.target.value as Area)} className={field}>
            <option value="" disabled>
              {t.newTrip.pickArea}
            </option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {t.area[a]}
              </option>
            ))}
          </select>
        </Field>
        <div>
          <div className="grid grid-cols-2 gap-2">
            <Field label={t.newTrip.from} htmlFor="from">
              <input id="from" type="date" min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} className={field} />
            </Field>
            <Field label={t.newTrip.to} htmlFor="to">
              <input id="to" type="date" min={startDate || today} value={endDate} onChange={(e) => setEndDate(e.target.value)} className={field} />
            </Field>
          </div>
          {errors.dates ? (
            <p data-error className="mt-1 text-sm text-coral">{errors.dates}</p>
          ) : (
            tripDays > 0 && <p className="mt-1 text-sm text-muted">{t.trip.days(tripDays)}</p>
          )}
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">{t.newTrip.wanted}</legend>
        <div className="grid grid-cols-3 gap-2">
          {WANTED.map((w) => (
            <Chip key={w} selected={wanted === w} onClick={() => setWanted(w)} className="justify-center">
              {t.wanted[me.gender][w]}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">{t.newTrip.styles}</legend>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <Chip key={s} selected={styles.includes(s)} onClick={() => toggleStyle(s)}>
              {t.style[s]}
            </Chip>
          ))}
        </div>
      </fieldset>

      <Field label={t.newTrip.description} htmlFor="description">
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.newTrip.descriptionPlaceholder}
          className={`${field} resize-none`}
        />
      </Field>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">{t.newTrip.deadline}</legend>
        <div className="grid grid-cols-2 gap-2">
          <Chip selected={deadlineType === "daysBefore"} onClick={() => setDeadlineType("daysBefore")} className="justify-center">
            {t.newTrip.deadlineDays}
          </Chip>
          <Chip selected={deadlineType === "date"} onClick={() => setDeadlineType("date")} className="justify-center">
            {t.newTrip.deadlineDate}
          </Chip>
        </div>
        <div className="mt-2">
          {deadlineType === "daysBefore" ? (
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={90}
                value={daysBefore}
                onChange={(e) => setDaysBefore(Math.max(1, Math.min(90, Number(e.target.value) || 1)))}
                className={`${field} w-20 text-center`}
              />
              {t.newTrip.daysBeforeSuffix}
            </label>
          ) : (
            <input
              type="date"
              aria-label={t.newTrip.deadlineDate}
              min={today}
              max={startDate || undefined}
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
              className={field}
            />
          )}
          {errors.deadline && <p data-error className="mt-1 text-sm text-coral">{errors.deadline}</p>}
        </div>
      </fieldset>

      <button type="submit" className="w-full rounded-xl bg-brand py-3.5 text-base font-semibold text-white shadow-sm hover:bg-brand-strong">
        {kind === "booked" ? t.newTrip.toPayment : t.newTrip.publish}
      </button>
    </form>
  );
}

function Field({ label, error, htmlFor, children }: { label: string; error?: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {error && <p data-error className="mt-1 text-sm text-coral">{error}</p>}
    </div>
  );
}

function Chip({
  selected,
  onClick,
  className = "",
  children,
}: {
  selected: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-medium ring-1 transition ${
        selected ? "bg-brand-soft text-brand-strong ring-brand" : "bg-white text-ink ring-line hover:ring-brand/40"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function KindOption({
  selected,
  onSelect,
  icon,
  title,
  desc,
  price,
  tone,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
  price: string;
  tone: "plan" | "brand";
}) {
  const on = tone === "plan" ? "bg-plan-soft ring-plan text-plan" : "bg-brand-soft ring-brand text-brand-strong";
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex flex-col items-start gap-1 rounded-2xl p-3 text-start ring-1 transition ${
        selected ? `${on} ring-2` : "bg-white text-ink ring-line hover:ring-brand/40"
      }`}
    >
      {icon}
      <span className="font-semibold">{title}</span>
      <span className="text-xs leading-snug opacity-80">{desc}</span>
      <span className="mt-1 rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold">{price}</span>
    </button>
  );
}

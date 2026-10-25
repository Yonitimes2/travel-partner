"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BadgeCheck, Lightbulb } from "lucide-react";
import { PaymentPanel } from "./Payment";
import { Body, Chip, Field, PageHeader, inputClass, primaryButton } from "./ui";
import { useT, useToast } from "./Providers";
import { AREAS } from "./Feed";
import { Photo } from "./Photo";
import { addDays, altEndDate, daysBetween, formatDay } from "@/lib/dates";
import { photosOf } from "@/lib/photos";
import { BETA, PLANNED_LIMIT, TRIP_FEE, activePlanned } from "@/lib/rules";
import { findUser, useApp, type TripInput } from "@/lib/store";
import type { Area, DateFlex, Deadline, PhotoId, Trip, TripKind, TripStyle, Wanted } from "@/lib/types";

const WANTED: Wanted[] = ["one", "few", "families"];
const STYLES: TripStyle[] = ["hiking", "nature", "cities", "relaxed", "adventure", "shabbat", "food"];

type Errors = Partial<Record<"place" | "area" | "dates" | "alt" | "deadline", string>>;

/** posting a trip, or editing one (`trip`) */
export function TripForm({ trip }: { trip?: Trip }) {
  const { t, lang, href } = useT();
  const toast = useToast();
  const router = useRouter();
  const { users, trips, meId, today, createTrip, updateTrip } = useApp();
  const me = findUser(users, meId)!;

  // a planned trip is free, but only PLANNED_LIMIT can be active at once (editing one doesn't count twice)
  const plannedFull = activePlanned(trips, meId, today) >= PLANNED_LIMIT && trip?.kind !== "planned";
  const lockedClosed = trip?.kind === "closed";

  const [kind, setKind] = useState<TripKind>(trip?.kind ?? (plannedFull ? "closed" : "planned"));
  const [place, setPlace] = useState(trip?.place ?? "");
  const [area, setArea] = useState<Area | "">(trip?.area ?? "");
  const [photo, setPhoto] = useState<PhotoId | undefined>(trip?.photo);
  const [startDate, setStartDate] = useState(trip?.startDate ?? "");
  const [endDate, setEndDate] = useState(trip?.endDate ?? "");
  // how settled a planned trip's dates are (a range is entered in days or weeks, kept in days)
  const [flexType, setFlexType] = useState<DateFlex["type"]>(trip?.flex?.type ?? "fixed");
  const [altStart, setAltStart] = useState(trip?.flex?.type === "alt" ? trip.flex.startDate : "");
  const initialRange = trip?.flex?.type === "range" ? trip.flex.days : 3;
  const [rangeUnit, setRangeUnit] = useState<"days" | "weeks">(initialRange % 7 === 0 ? "weeks" : "days");
  const [rangeAmount, setRangeAmount] = useState(initialRange % 7 === 0 ? initialRange / 7 : initialRange);
  const [wanted, setWanted] = useState<Wanted>(trip?.wanted ?? "few");
  const [styles, setStyles] = useState<TripStyle[]>(trip?.styles ?? []);
  const [description, setDescription] = useState(trip?.description ?? "");
  const [deadlineType, setDeadlineType] = useState<Deadline["type"]>(trip?.deadline.type ?? "daysBefore");
  const [deadlineDate, setDeadlineDate] = useState(trip?.deadline.type === "date" ? trip.deadline.date : "");
  const [daysBefore, setDaysBefore] = useState(trip?.deadline.type === "daysBefore" ? trip.deadline.days : 7);
  const [errors, setErrors] = useState<Errors>({});
  const [paying, setPaying] = useState<TripInput | null>(null);

  const toggleStyle = (s: TripStyle) => setStyles((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const validate = (): TripInput | null => {
    const e: Errors = {};
    if (!place.trim()) e.place = t.newTrip.errors.place;
    if (!area) e.area = t.newTrip.errors.area;
    if (!startDate || !endDate) e.dates = t.newTrip.errors.dates;
    else if (endDate < startDate) e.dates = t.newTrip.errors.order;
    else if (startDate < today) e.dates = t.newTrip.errors.past;

    // only a planned trip has date options; a closed trip's dates are final
    const flex: DateFlex | undefined =
      kind !== "planned"
        ? undefined
        : flexType === "alt"
          ? { type: "alt", startDate: altStart }
          : flexType === "range"
            ? { type: "range", days: rangeAmount * (rangeUnit === "weeks" ? 7 : 1) }
            : { type: "fixed" };
    if (flex?.type === "alt" && (!altStart || altStart < today || altStart === startDate)) e.alt = t.newTrip.errors.alt;

    const deadline: Deadline = deadlineType === "date" ? { type: "date", date: deadlineDate } : { type: "daysBefore", days: daysBefore };
    if (!e.dates && !e.alt) {
      // the deadline must come before the earliest possible departure
      const earliest =
        flex?.type === "alt" && altStart < startDate ? altStart : flex?.type === "range" ? addDays(startDate, -flex.days) : startDate;
      const last = deadline.type === "date" ? deadline.date : addDays(earliest, -deadline.days);
      if (!last || last < today || last > earliest) e.deadline = t.newTrip.errors.deadline;
    }

    setErrors(e);
    if (Object.keys(e).length > 0) {
      // bring the first message into view (the form is longer than a phone screen)
      requestAnimationFrame(() => document.querySelector("[data-error]")?.scrollIntoView({ block: "center", behavior: "smooth" }));
      return null;
    }
    return { kind, place: place.trim(), area: area as Area, photo: photo ?? photosOf(area as Area)[0], startDate, endDate, flex, wanted, styles, description: description.trim(), deadline };
  };

  const save = (input: TripInput) => {
    if (trip) {
      updateTrip(trip.id, input);
      toast(t.newTrip.saved);
      router.push(href(`/trips/${trip.id}`));
    } else {
      const id = createTrip(input);
      toast(t.newTrip.published);
      router.push(href(`/trips/${id}`));
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = validate();
    if (!input) return;
    // the paid step comes once: when a trip becomes closed
    if (input.kind === "closed" && trip?.kind !== "closed") {
      setPaying(input);
      window.scrollTo({ top: 0 });
    } else save(input);
  };

  if (paying) {
    return (
      <div>
        <PageHeader title={t.payment.title} />
        <Body>
          <PaymentPanel trip={paying} onPay={() => save(paying)} onBack={() => setPaying(null)} />
        </Body>
      </div>
    );
  }

  const tripDays = startDate && endDate && endDate >= startDate ? daysBetween(startDate, endDate) + 1 : 0;

  return (
    <div>
      <PageHeader title={trip ? t.newTrip.editTitle : t.newTrip.title} back={trip ? `/trips/${trip.id}` : undefined}>
        <p className="text-sm text-white/80">{t.newTrip.postedIn(wanted === "families" ? t.bothSections : t.postedIn[me.gender])}</p>
      </PageHeader>
      <Body>
        <form onSubmit={submit} noValidate className="space-y-6">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-ink">{t.newTrip.kindQuestion}</legend>
            <div className="grid grid-cols-2 gap-2.5">
              <KindOption
                selected={kind === "planned"}
                disabled={plannedFull || lockedClosed}
                onSelect={() => setKind("planned")}
                icon={<Lightbulb size={22} aria-hidden />}
                title={t.newTrip.plannedTitle}
                desc={t.newTrip.plannedDesc}
                price={<span className="font-bold">{t.newTrip.free}</span>}
              />
              <KindOption
                selected={kind === "closed"}
                onSelect={() => setKind("closed")}
                icon={<BadgeCheck size={22} aria-hidden />}
                title={t.newTrip.closedTitle}
                desc={t.newTrip.closedDesc}
                price={
                  BETA ? (
                    <>
                      <span className="line-through opacity-60">{TRIP_FEE}</span> <span className="font-bold">{t.newTrip.betaFree}</span>
                    </>
                  ) : (
                    <span className="font-bold">{TRIP_FEE}</span>
                  )
                }
              />
            </div>
            {plannedFull && !lockedClosed && <p className="mt-2 text-sm text-muted">{t.newTrip.plannedLimitReached}</p>}
            {lockedClosed && <p className="mt-2 text-sm text-muted">{t.newTrip.stayClosed}</p>}
          </fieldset>

          <div className="space-y-4">
            <Field label={t.newTrip.place} error={errors.place} htmlFor="place">
              <input id="place" value={place} onChange={(e) => setPlace(e.target.value)} placeholder={t.newTrip.placePlaceholder} className={inputClass} />
            </Field>
            <Field label={t.newTrip.area} error={errors.area} htmlFor="area">
              <select
                id="area"
                value={area}
                onChange={(e) => {
                  setArea(e.target.value as Area);
                  setPhoto(undefined);
                }}
                className={inputClass}
              >
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
            {area && (
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-ink">{t.newTrip.cover}</legend>
                <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
                  {photosOf(area).map((id, i) => {
                    const on = (photo ?? photosOf(area)[0]) === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={on}
                        aria-label={`${t.newTrip.cover} ${i + 1}`}
                        onClick={() => setPhoto(id)}
                        className={`relative h-20 w-32 shrink-0 overflow-hidden rounded-2xl transition ${on ? "ring-[3px] ring-sky ring-offset-2 ring-offset-mist" : "opacity-75 hover:opacity-100"}`}
                      >
                        <Photo area={area} photo={id} sizes="128px" />
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}
            <div>
              <div className="grid grid-cols-2 gap-2.5">
                <Field label={t.newTrip.from} htmlFor="from">
                  <input id="from" type="date" min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
                </Field>
                <Field label={t.newTrip.to} htmlFor="to">
                  <input id="to" type="date" min={startDate || today} value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
                </Field>
              </div>
              {errors.dates ? (
                <p data-error className="mt-1 text-sm text-coral">
                  {errors.dates}
                </p>
              ) : (
                tripDays > 0 && <p className="mt-1 text-sm font-medium text-sky">{t.duration(tripDays)}</p>
              )}
            </div>

            {kind === "planned" && (
              <fieldset className="rounded-3xl bg-white p-4 ring-1 ring-line">
                <legend className="sr-only">{t.newTrip.flexTitle}</legend>
                <p aria-hidden className="mb-2.5 text-sm font-semibold text-ink">
                  {t.newTrip.flexTitle}
                </p>
                <div className="grid gap-2">
                  {(["fixed", "alt", "range"] as const).map((f) => (
                    <Chip key={f} selected={flexType === f} onClick={() => setFlexType(f)}>
                      {t.newTrip.flex[f]}
                    </Chip>
                  ))}
                </div>

                {flexType === "alt" && (
                  <div className="mt-3">
                    <Field label={t.newTrip.altDate} error={errors.alt} htmlFor="alt">
                      <input id="alt" type="date" min={today} value={altStart} onChange={(e) => setAltStart(e.target.value)} className={inputClass} />
                    </Field>
                    {altStart && tripDays > 0 && !errors.alt && (
                      <p className="mt-1 text-sm text-muted">{t.newTrip.altReturn(formatDay(altEndDate({ startDate, endDate }, altStart), lang))}</p>
                    )}
                  </div>
                )}

                {flexType === "range" && (
                  <div className="mt-3">
                    <p className="mb-1.5 text-sm font-semibold text-ink">{t.newTrip.rangeLabel}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-sky">±</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        aria-label={t.newTrip.rangeLabel}
                        min={1}
                        max={rangeUnit === "weeks" ? 8 : 30}
                        value={rangeAmount}
                        onChange={(e) => setRangeAmount(Math.max(1, Math.min(rangeUnit === "weeks" ? 8 : 30, Number(e.target.value) || 1)))}
                        className={`${inputClass} w-20 text-center`}
                      />
                      {(["days", "weeks"] as const).map((u) => (
                        <Chip key={u} selected={rangeUnit === u} onClick={() => setRangeUnit(u)}>
                          {t.newTrip.unit[u]}
                        </Chip>
                      ))}
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-sky">{t.trip.plusMinus(rangeAmount * (rangeUnit === "weeks" ? 7 : 1))}</p>
                  </div>
                )}
              </fieldset>
            )}
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
            {wanted === "families" && <p className="mt-2 text-sm text-gold">{t.newTrip.familiesNote}</p>}
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
              className={`${inputClass} resize-none`}
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
            <div className="mt-2.5">
              {deadlineType === "daysBefore" ? (
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={90}
                    value={daysBefore}
                    onChange={(e) => setDaysBefore(Math.max(1, Math.min(90, Number(e.target.value) || 1)))}
                    className={`${inputClass} w-20 text-center`}
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
                  className={inputClass}
                />
              )}
              {errors.deadline && (
                <p data-error className="mt-1 text-sm text-coral">
                  {errors.deadline}
                </p>
              )}
            </div>
          </fieldset>

          <button type="submit" className={`${primaryButton} w-full py-4`}>
            {kind === "closed" && trip?.kind !== "closed" ? t.newTrip.toPayment : trip ? t.newTrip.save : t.newTrip.publish}
          </button>
        </form>
      </Body>
    </div>
  );
}

function KindOption({
  selected,
  disabled = false,
  onSelect,
  icon,
  title,
  desc,
  price,
}: {
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
  price: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      className={`flex flex-col items-start gap-1 rounded-3xl p-3.5 text-start transition disabled:opacity-40 ${
        selected ? "bg-navy text-white shadow-lg shadow-navy/25" : "bg-white text-ink ring-1 ring-line hover:ring-sky/40"
      }`}
    >
      <span className={selected ? "text-white" : "text-sky"}>{icon}</span>
      <span className="font-bold">{title}</span>
      <span className="text-xs leading-snug opacity-80">{desc}</span>
      <span className={`mt-1.5 rounded-full px-2.5 py-0.5 text-xs ${selected ? "bg-white/15" : "bg-mist"}`}>{price}</span>
    </button>
  );
}

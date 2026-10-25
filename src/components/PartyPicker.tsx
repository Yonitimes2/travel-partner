"use client";

import { Minus, Plus, User, Users, UsersRound } from "lucide-react";
import { inputClass } from "./ui";
import { useT } from "./Providers";
import type { Party } from "@/lib/types";

const TYPES: { type: Party["type"]; Icon: typeof User }[] = [
  { type: "solo", Icon: User },
  { type: "group", Icon: Users },
  { type: "family", Icon: UsersRound },
];

/** who's coming: alone, with other people (a number and a note, both optional), or a family (1–2 parents, 0+ children) */
export function PartyPicker({ value, onChange, label }: { value: Party; onChange: (p: Party) => void; label: string }) {
  const { t } = useT();

  const pick = (type: Party["type"]) => {
    if (type === value.type) return;
    onChange(type === "solo" ? { type } : type === "group" ? { type, others: 0, note: "" } : { type, parents: 2, kids: 0 });
  };

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-ink">{label}</legend>
      <div className="grid grid-cols-3 gap-2">
        {TYPES.map(({ type, Icon }) => {
          const on = value.type === type;
          return (
            <button
              key={type}
              type="button"
              aria-pressed={on}
              onClick={() => pick(type)}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-sm font-semibold ring-1 transition ${
                on ? "bg-navy text-white ring-navy" : "bg-white text-ink ring-line hover:ring-sky/40"
              }`}
            >
              <Icon size={20} aria-hidden />
              {t.partyType[type]}
            </button>
          );
        })}
      </div>

      {value.type === "group" && (
        <div className="mt-3 space-y-3 rounded-2xl bg-mist p-3">
          <Stepper
            label={t.partyForm.others}
            value={value.others}
            min={0}
            max={20}
            onChange={(others) => onChange({ ...value, others })}
            empty="—"
          />
          <div>
            <label htmlFor="party-note" className="mb-1.5 block text-sm font-medium text-ink">
              {t.partyForm.note}
            </label>
            <input
              id="party-note"
              value={value.note}
              maxLength={80}
              onChange={(e) => onChange({ ...value, note: e.target.value })}
              placeholder={t.partyForm.notePlaceholder}
              className={inputClass}
            />
          </div>
        </div>
      )}

      {value.type === "family" && (
        <div className="mt-3 space-y-3 rounded-2xl bg-mist p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-ink">{t.partyForm.parents}</span>
            <span className="flex rounded-full bg-white p-1 ring-1 ring-line">
              {([1, 2] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={value.parents === n}
                  onClick={() => onChange({ ...value, parents: n })}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${value.parents === n ? "bg-navy text-white" : "text-muted"}`}
                >
                  {n === 1 ? t.partyForm.oneParent : t.partyForm.twoParents}
                </button>
              ))}
            </span>
          </div>
          <Stepper label={t.partyForm.kids} value={value.kids} min={0} max={15} onChange={(kids) => onChange({ ...value, kids })} />
        </div>
      )}

      <p className="mt-2 text-sm font-medium text-sky">{t.partyText(value)}</p>
    </fieldset>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  empty,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  /** what to show at the minimum, when the number is optional */
  empty?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-ink">{label}</span>
      <span className="flex items-center gap-3">
        <button
          type="button"
          aria-label="-"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-line disabled:opacity-40"
        >
          <Minus size={16} aria-hidden />
        </button>
        <span className="digits w-6 text-center text-lg font-bold" aria-live="polite">
          {value === min && empty ? empty : value}
        </span>
        <button
          type="button"
          aria-label="+"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-line disabled:opacity-40"
        >
          <Plus size={16} aria-hidden />
        </button>
      </span>
    </div>
  );
}

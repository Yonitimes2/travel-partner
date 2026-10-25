"use client";

import { BadgeCheck, FlaskConical, Sparkles } from "lucide-react";
import { FlightLine } from "./TripBits";
import { primaryButton } from "./ui";
import { useT } from "./Providers";
import { BETA, TRIP_FEE } from "@/lib/rules";
import type { Trip } from "@/lib/types";

/** closing a trip: the one paid step (free while the beta lasts) */
export function PaymentPanel({
  trip,
  onPay,
  onBack,
}: {
  trip: Pick<Trip, "place" | "startDate" | "endDate">;
  onPay: () => void;
  onBack: () => void;
}) {
  const { t } = useT();
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_10px_30px_-14px_rgba(11,29,77,0.35)] ring-1 ring-line">
        <div className="bg-gradient-to-br from-navy to-navy-2 px-4 py-4 text-white">
          <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2.5 py-1 text-xs font-bold">
            <BadgeCheck size={14} aria-hidden />
            {t.kind.closed}
          </span>
          <div className="mt-2 text-xl font-bold">{trip.place}</div>
        </div>
        <div className="px-4 py-3">
          <FlightLine trip={trip as Trip} />
        </div>
        <div className="perforation" />
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <span className="text-sm text-muted">{t.payment.once}</span>
          <span className="flex items-baseline gap-2">
            {BETA && <span className="text-lg font-semibold text-muted line-through">{TRIP_FEE}</span>}
            <span className="text-3xl font-extrabold text-ink">{BETA ? t.newTrip.free : TRIP_FEE}</span>
          </span>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-ink">{t.payment.explain}</p>
      {BETA && (
        <p className="flex items-center gap-2 rounded-2xl bg-mint-soft px-3.5 py-2.5 text-sm font-semibold text-mint">
          <Sparkles size={16} aria-hidden />
          {t.payment.beta}
        </p>
      )}
      <p className="flex items-start gap-2 rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
        <FlaskConical size={16} className="mt-0.5 shrink-0" aria-hidden />
        {t.payment.demo}
      </p>

      <button type="button" onClick={onPay} className={`${primaryButton} w-full`}>
        {t.payment.payBeta}
      </button>
      <button type="button" onClick={onBack} className="w-full py-2 text-sm font-semibold text-muted">
        {t.payment.back}
      </button>
    </div>
  );
}

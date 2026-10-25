"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check, Clock, Lock, MapPin, MessageCircle, Users, X } from "lucide-react";
import { Avatar } from "./Avatar";
import { DeadlineLine, KindBadge, StyleChips, TripDates } from "./TripBits";
import { useT, useToast } from "./Providers";
import { isOpen } from "@/lib/dates";
import { findUser, useApp } from "@/lib/store";
import type { Trip, User } from "@/lib/types";

export const NOTE_MAX = 200;

export function BackLink({ to }: { to: string }) {
  const { t, href } = useT();
  return (
    <Link href={href(to)} className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
      <ArrowLeft size={16} className="rtl:rotate-180" aria-hidden />
      {t.trip.back}
    </Link>
  );
}

export function TripView({ id }: { id: string }) {
  const { t } = useT();
  const { users, trips, meId, today } = useApp();
  const me = findUser(users, meId)!;
  const trip = trips.find((tr) => tr.id === id);
  const owner = trip && findUser(users, trip.ownerId);

  // a trip from the other section doesn't exist as far as this viewer is concerned
  if (!trip || !owner || owner.gender !== me.gender) {
    return (
      <div>
        <BackLink to="/" />
        <div className="rounded-2xl bg-white px-4 py-10 text-center text-muted ring-1 ring-line">{t.trip.notFound}</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <BackLink to="/" />

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line">
        <KindBadge kind={trip.kind} />
        <h1 className="mt-3 text-2xl font-bold leading-tight text-ink">{trip.place}</h1>
        <div className="mt-3 space-y-2 text-sm text-ink">
          <div>
            <TripDates trip={trip} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={16} className="text-muted" aria-hidden />
              {t.area[trip.area]}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users size={16} className="text-muted" aria-hidden />
              {t.wanted[owner.gender][trip.wanted]}
            </span>
          </div>
        </div>
      </section>

      <JoinAction trip={trip} owner={owner} meId={meId} today={today} />

      <section className="rounded-2xl bg-white p-4 ring-1 ring-line">
        {trip.description && (
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-muted">{t.trip.about}</h2>
            <p className="mt-1.5 whitespace-pre-line leading-relaxed text-ink">{trip.description}</p>
          </div>
        )}
        {trip.styles.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-muted">{t.trip.style}</h2>
            <div className="mt-2">
              <StyleChips trip={trip} />
            </div>
          </div>
        )}
        <h2 className="text-sm font-semibold text-muted">{t.trip.joining}</h2>
        <div className="mt-1.5 text-sm text-ink">
          <DeadlineLine trip={trip} today={today} />
          {trip.deadline.type === "daysBefore" && (
            <p className="mt-1 ps-6 text-xs text-muted">{t.trip.daysBefore(trip.deadline.days)}</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 ring-1 ring-line">
        <h2 className="text-sm font-semibold text-muted">{t.trip.postedBy}</h2>
        <div className="mt-2 flex items-center gap-3">
          <Avatar id={owner.avatar} size={48} />
          <div className="min-w-0">
            <div className="font-semibold text-ink">{owner.nickname}</div>
            <div className="text-sm text-muted">
              {owner.city} · {t.travelsAs[owner.travelsAs]}
            </div>
          </div>
        </div>
        {owner.about && <p className="mt-2 text-sm text-ink">{owner.about}</p>}
      </section>
    </div>
  );
}

function JoinAction({ trip, owner, meId, today }: { trip: Trip; owner: User; meId: string; today: string }) {
  const { t, href } = useT();
  const requests = useApp((s) => s.requests);
  const respond = useApp((s) => s.respond);
  const [open, setOpen] = useState(false);

  const mine = requests.find((r) => r.tripId === trip.id && r.fromUserId === meId);
  const incoming = requests.filter((r) => r.tripId === trip.id && r.status === "pending").length;

  let body: React.ReactNode;
  if (trip.ownerId === meId) {
    body = (
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-ink">{t.trip.yours}</span>
        <Link href={href("/my")} className="rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand-strong">
          {t.trip.manage}
          {incoming > 0 && ` (${t.trip.requests(incoming)})`}
        </Link>
      </div>
    );
  } else if (mine?.status === "pending") {
    body = (
      <div className="space-y-2">
        <p className="flex items-center gap-2 text-sm font-medium text-plan">
          <Clock size={18} aria-hidden />
          {t.trip.requestPending}
        </p>
        <button
          type="button"
          onClick={() => respond(mine.id, "accepted")}
          className="w-full rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900"
        >
          {t.demo.simulateAccept}
        </button>
      </div>
    );
  } else if (mine?.status === "accepted") {
    body = (
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium text-brand">
          <Check size={18} aria-hidden />
          {t.trip.requestAccepted}
        </span>
        <Link
          href={href(`/chat/${mine.id}`)}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
        >
          <MessageCircle size={16} aria-hidden />
          {t.trip.openChat}
        </Link>
      </div>
    );
  } else if (mine?.status === "declined") {
    body = (
      <p className="flex items-center gap-2 text-sm font-medium text-muted">
        <X size={18} aria-hidden />
        {t.trip.requestDeclined}
      </p>
    );
  } else if (!isOpen(trip, today)) {
    body = <p className="text-sm font-medium text-muted">{t.trip.closed}</p>;
  } else {
    body = (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl bg-brand py-3 text-base font-semibold text-white shadow-sm hover:bg-brand-strong"
      >
        {t.trip.askToJoin}
      </button>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-line">
      {body}
      {trip.ownerId !== meId && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted">
          <Lock size={13} className="mt-0.5 shrink-0" aria-hidden />
          {t.trip.contactRule}
        </p>
      )}
      {open && <JoinSheet trip={trip} owner={owner} onClose={() => setOpen(false)} />}
    </section>
  );
}

function JoinSheet({ trip, owner, onClose }: { trip: Trip; owner: User; onClose: () => void }) {
  const { t } = useT();
  const toast = useToast();
  const askToJoin = useApp((s) => s.askToJoin);
  const [note, setNote] = useState("");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    askToJoin(trip.id, note);
    toast(t.join.sent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40" onClick={onClose}>
      <form
        onSubmit={send}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
        aria-labelledby="join-title"
        className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        <h2 id="join-title" className="text-lg font-bold text-ink">
          {t.join.title}
        </h2>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted">
          <Avatar id={owner.avatar} size={22} />
          {owner.nickname} · {trip.place}
        </p>

        {trip.wanted === "families" && (
          <p className="mt-3 rounded-xl bg-plan-soft px-3 py-2 text-sm text-plan">{t.join.familiesHint}</p>
        )}

        <label className="mt-4 block text-sm font-medium text-ink" htmlFor="join-note">
          {t.join.noteLabel}
        </label>
        <textarea
          id="join-note"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
          maxLength={NOTE_MAX}
          rows={3}
          autoFocus
          placeholder={t.join.notePlaceholder}
          className="mt-1.5 w-full resize-none rounded-xl border border-line bg-cream px-3 py-2.5 text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <div className="mt-1 text-end text-xs text-muted" dir="ltr">
          {note.length}/{NOTE_MAX}
        </div>

        <div className="mt-4 flex gap-2">
          <button type="submit" className="flex-1 rounded-xl bg-brand py-3 font-semibold text-white hover:bg-brand-strong">
            {t.join.send}
          </button>
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-3 font-medium text-muted hover:bg-cream">
            {t.join.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}

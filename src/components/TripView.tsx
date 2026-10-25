"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Clock, Hourglass, Lock, MapPin, MessageCircle, Minus, Pencil, Plus, Users, X } from "lucide-react";
import { Avatar } from "./Avatar";
import { UserActions } from "./Moderation";
import { Photo } from "./Photo";
import { FlightLine, KindBadge, StyleChips } from "./TripBits";
import { BackButton, Card, PointsPill, Sheet, inputClass, primaryButton } from "./ui";
import { useT, useToast } from "./Providers";
import { daysBetween, deadlineOf, formatDay, isOpen } from "@/lib/dates";
import { canSee, statsOf } from "@/lib/rules";
import { findUser, useApp } from "@/lib/store";
import type { Trip, User } from "@/lib/types";

export const NOTE_MAX = 200;

/** age group, observance, pace and how they travel — what helps decide on a partner */
export function ProfileFacts({ user }: { user: User }) {
  const { t } = useT();
  const facts = [t.ageLabel(t.ageGroup[user.ageGroup]), t.observance[user.observance], t.pace[user.pace], t.travelsAs[user.travelsAs]];
  return (
    <div className="flex flex-wrap gap-1.5">
      {facts.map((f) => (
        <span key={f} className="rounded-full bg-sky-soft px-2.5 py-1 text-xs font-semibold text-navy">
          {f}
        </span>
      ))}
    </div>
  );
}

export function TripView({ id }: { id: string }) {
  const { t, lang, href } = useT();
  const router = useRouter();
  const { users, trips, requests, blocks, meId, today } = useApp();
  const me = findUser(users, meId)!;
  const trip = trips.find((tr) => tr.id === id);
  const owner = trip && findUser(users, trip.ownerId);
  const hasRequest = requests.some((r) => r.tripId === id && r.fromUserId === meId);

  // a trip from the other section doesn't exist as far as this viewer is concerned
  if (!trip || !owner || (!canSee(trip, owner, me, blocks) && !hasRequest)) {
    return (
      <div className="p-4">
        <BackButton to="/" onDark={false} />
        <Card className="mt-4 py-10 text-center text-muted">{t.trip.notFound}</Card>
      </div>
    );
  }

  const mine = trip.ownerId === meId;
  const toGo = Math.max(0, daysBetween(today, trip.startDate));
  const stats = statsOf(owner, trips, requests);

  return (
    <div>
      <section className="relative h-72 overflow-hidden text-white">
        <Photo area={trip.area} photo={trip.photo} seed={trip.id} sizes="(max-width: 448px) 100vw, 448px" preload />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/10 to-navy/90" />
        <div className="relative flex h-full flex-col px-4 pb-14 pt-4">
          <div className="flex items-center justify-between">
            <BackButton to={mine ? "/my" : "/"} />
            {mine ? (
              <Link href={href(`/trips/${trip.id}/edit`)} aria-label={t.trip.edit} className="glass flex h-10 w-10 items-center justify-center rounded-full">
                <Pencil size={18} aria-hidden />
              </Link>
            ) : (
              <UserActions user={owner} onBlocked={() => router.push(href("/"))} />
            )}
          </div>
          <div className="mt-auto">
            <div className="flex flex-wrap items-center gap-2">
              <KindBadge kind={trip.kind} onDark />
              {trip.wanted === "families" && <span className="glass rounded-full px-2.5 py-1 text-xs font-semibold">{t.trip.families}</span>}
            </div>
            <h1 className="mt-2 text-[28px] font-extrabold leading-tight">{trip.place}</h1>
            <p className="mt-0.5 flex items-center gap-1 text-sm opacity-85">
              <MapPin size={14} aria-hidden />
              {t.area[trip.area]}
            </p>
          </div>
        </div>
      </section>

      <div className="relative -mt-10 space-y-3 px-4">
        {/* the countdown and the boarding-pass dates */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_14px_36px_-16px_rgba(11,29,77,0.45)]">
          <div className="flex items-center gap-4 px-4 py-4">
            <div className="text-center">
              <div className="digits text-5xl font-extrabold leading-none text-navy">{toGo}</div>
              <div className="mt-1 text-xs font-semibold text-muted">{t.trip.daysToGo}</div>
            </div>
            <div className="h-14 w-px bg-line" />
            <div className="min-w-0 flex-1">
              <FlightLine trip={trip} />
            </div>
          </div>
          <div className="perforation" />
          <div className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
            <span className="inline-flex items-center gap-1.5 font-semibold text-navy">
              <Users size={16} aria-hidden />
              {t.wanted[owner.gender][trip.wanted]}
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted">
              <Hourglass size={15} aria-hidden />
              {trip.status === "full" ? t.trip.full : t.trip.openUntil(formatDay(deadlineOf(trip), lang))}
            </span>
          </div>
        </div>

        <JoinAction trip={trip} owner={owner} meId={meId} today={today} />

        {(trip.description || trip.styles.length > 0) && (
          <Card>
            {trip.description && (
              <>
                <h2 className="text-sm font-bold text-muted">{t.trip.about}</h2>
                <p className="mt-1.5 whitespace-pre-line leading-relaxed text-ink">{trip.description}</p>
              </>
            )}
            {trip.styles.length > 0 && (
              <div className={trip.description ? "mt-4" : ""}>
                <h2 className="text-sm font-bold text-muted">{t.trip.style}</h2>
                <div className="mt-2">
                  <StyleChips trip={trip} />
                </div>
              </div>
            )}
          </Card>
        )}

        <Card>
          <h2 className="text-sm font-bold text-muted">{t.trip.postedBy}</h2>
          <div className="mt-2 flex items-center gap-3">
            <Avatar id={owner.avatar} size={52} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-bold text-ink">{owner.nickname}</span>
                <PointsPill points={stats.points} />
              </div>
              <div className="text-sm text-muted">
                {owner.city} · {t.stats(stats.trips, stats.joined)}
              </div>
            </div>
          </div>
          <div className="mt-3">
            <ProfileFacts user={owner} />
          </div>
          {owner.about && <p className="mt-3 text-sm text-ink">{owner.about}</p>}
        </Card>
      </div>
    </div>
  );
}

function JoinAction({ trip, owner, meId, today }: { trip: Trip; owner: User; meId: string; today: string }) {
  const { t, href } = useT();
  const requests = useApp((s) => s.requests);
  const respond = useApp((s) => s.respond);
  const closeTrip = useApp((s) => s.closeTrip);
  const [open, setOpen] = useState(false);

  const mine = requests.find((r) => r.tripId === trip.id && r.fromUserId === meId);
  const incoming = requests.filter((r) => r.tripId === trip.id && r.status === "pending").length;

  let body: React.ReactNode;
  if (trip.ownerId === meId) {
    body = (
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-ink">{t.trip.yours}</span>
        <Link href={href("/my")} className="rounded-full bg-sky-soft px-4 py-2 text-sm font-bold text-navy">
          {t.trip.manage}
          {incoming > 0 && ` (${t.trip.requests(incoming)})`}
        </Link>
      </div>
    );
  } else if (mine?.status === "pending") {
    body = (
      <div className="space-y-3">
        <p className="flex items-center gap-2 font-semibold text-sky">
          <Clock size={18} aria-hidden />
          {t.trip.requestPending}
        </p>
        {trip.kind === "planned" && <p className="text-sm text-muted">{t.join.plannedNote}</p>}
        <button
          type="button"
          onClick={() => {
            // in the demo the owner closes the trip (if needed) and accepts
            if (trip.kind === "planned") closeTrip(trip.id);
            respond(mine.id, "accepted");
          }}
          className="w-full rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-900"
        >
          {t.demo.simulateAccept}
        </button>
      </div>
    );
  } else if (mine?.status === "accepted") {
    body = (
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-semibold text-mint">
          <Check size={18} aria-hidden />
          {t.trip.requestAccepted}
        </span>
        <Link href={href(`/chat/${mine.id}`)} className={`${primaryButton} px-4 py-2.5 text-sm`}>
          <MessageCircle size={16} aria-hidden />
          {t.trip.openChat}
        </Link>
      </div>
    );
  } else if (mine?.status === "declined") {
    body = (
      <p className="flex items-center gap-2 font-semibold text-muted">
        <X size={18} aria-hidden />
        {t.trip.requestDeclined}
      </p>
    );
  } else if (!isOpen(trip, today)) {
    body = <p className="font-semibold text-muted">{trip.status === "full" ? t.trip.full : t.trip.closedToRequests}</p>;
  } else {
    body = (
      <button type="button" onClick={() => setOpen(true)} className={`${primaryButton} w-full py-4 text-lg`}>
        {t.trip.askToJoin}
      </button>
    );
  }

  return (
    <Card>
      {body}
      {trip.ownerId !== meId && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted">
          <Lock size={13} className="mt-0.5 shrink-0" aria-hidden />
          {t.trip.contactRule}
        </p>
      )}
      {open && <JoinSheet trip={trip} owner={owner} onClose={() => setOpen(false)} />}
    </Card>
  );
}

function JoinSheet({ trip, owner, onClose }: { trip: Trip; owner: User; onClose: () => void }) {
  const { t } = useT();
  const toast = useToast();
  const askToJoin = useApp((s) => s.askToJoin);
  const [note, setNote] = useState("");
  const [party, setParty] = useState(trip.wanted === "families" ? 4 : 1);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    askToJoin(trip.id, note, party);
    toast(t.join.sent);
    onClose();
  };

  return (
    <Sheet onClose={onClose} labelledBy="join-title">
      <form onSubmit={send}>
        <h2 id="join-title" className="text-xl font-bold text-ink">
          {t.join.title}
        </h2>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted">
          <Avatar id={owner.avatar} size={22} />
          {owner.nickname} · {trip.place}
        </p>

        {trip.kind === "planned" && <p className="mt-3 rounded-2xl bg-sky-soft px-3.5 py-2.5 text-sm text-navy">{t.join.plannedNote}</p>}
        {trip.wanted === "families" && (
          <>
            <p className="mt-3 rounded-2xl bg-gold-soft px-3.5 py-2.5 text-sm text-gold">{t.join.familiesHint}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">{t.join.party}</span>
              <span className="flex items-center gap-3">
                <button type="button" aria-label="-" onClick={() => setParty((n) => Math.max(1, n - 1))} className="flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-line">
                  <Minus size={16} aria-hidden />
                </button>
                <span className="digits w-6 text-center text-lg font-bold">{party}</span>
                <button type="button" aria-label="+" onClick={() => setParty((n) => Math.min(15, n + 1))} className="flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-line">
                  <Plus size={16} aria-hidden />
                </button>
              </span>
            </div>
          </>
        )}

        <label className="mb-1.5 mt-4 block text-sm font-semibold text-ink" htmlFor="join-note">
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
          className={`${inputClass} resize-none`}
        />
        <div className="mt-1 text-end text-xs text-muted" dir="ltr">
          {note.length}/{NOTE_MAX}
        </div>

        <div className="mt-4 flex gap-2">
          <button type="submit" className={`${primaryButton} flex-1`}>
            {t.join.send}
          </button>
          <button type="button" onClick={onClose} className="rounded-2xl px-5 font-semibold text-muted">
            {t.join.cancel}
          </button>
        </div>
      </form>
    </Sheet>
  );
}

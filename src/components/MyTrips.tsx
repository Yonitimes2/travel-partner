"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Lock, MessageCircle, Pencil, PartyPopper, RotateCcw, Trash2, X } from "lucide-react";
import { Avatar } from "./Avatar";
import { PaymentPanel } from "./Payment";
import { Photo } from "./Photo";
import { FlightLine, KindBadge } from "./TripBits";
import { ProfileFacts } from "./TripView";
import { Body, Empty, PageHeader, PointsPill, SegTabs, Sheet, primaryButton } from "./ui";
import { useT, useToast } from "./Providers";
import { formatRange, isOpen } from "@/lib/dates";
import { findUser, useApp } from "@/lib/store";
import type { JoinRequest, RequestStatus, Trip } from "@/lib/types";

export function MyTrips() {
  const { t } = useT();
  const [tab, setTab] = useState<"posts" | "sent">("posts");

  return (
    <div>
      <PageHeader title={t.my.title} />
      <Body>
        <SegTabs
          value={tab}
          onChange={setTab}
          options={[
            { key: "posts", label: t.my.posts },
            { key: "sent", label: t.my.sent },
          ]}
        />
        <div className="mt-4">{tab === "posts" ? <Posted /> : <Sent />}</div>
      </Body>
    </div>
  );
}

function Posted() {
  const { t } = useT();
  const { trips, meId } = useApp();
  const mine = trips.filter((tr) => tr.ownerId === meId).sort((a, b) => a.startDate.localeCompare(b.startDate));
  if (mine.length === 0) return <Empty text={t.my.emptyPosts} action={t.my.postTrip} to="/new" />;
  return (
    <div className="space-y-5">
      {mine.map((trip) => (
        <PostedTrip key={trip.id} trip={trip} />
      ))}
    </div>
  );
}

function PostedTrip({ trip }: { trip: Trip }) {
  const { t, lang, href } = useT();
  const toast = useToast();
  const { users, requests, today, respond, closeTrip, setTripStatus, deleteTrip } = useApp();
  const [paying, setPaying] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const incoming = requests.filter((r) => r.tripId === trip.id);
  const pending = incoming.filter((r) => r.status === "pending").length;
  // a planned trip only shows the nickname and note; closing it unlocks the details and accepting
  const locked = trip.kind === "planned";
  const open = isOpen(trip, today);

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-[0_10px_30px_-16px_rgba(11,29,77,0.35)]">
      <Link href={href(`/trips/${trip.id}`)} className="relative block h-28">
        <Photo area={trip.area} photo={trip.photo} seed={trip.id} sizes="(max-width: 448px) 92vw, 416px" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />
        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          <KindBadge kind={trip.kind} onDark />
          {!open && (
            <span className="glass rounded-full px-2.5 py-1 text-xs font-semibold text-white">
              {trip.status === "full" ? t.trip.full : t.my.notOpen}
            </span>
          )}
        </div>
        <div className="absolute inset-x-4 bottom-2.5 text-white">
          <h2 className="text-lg font-bold leading-tight">{trip.place}</h2>
          <div className="text-xs opacity-85">{formatRange(trip.startDate, trip.endDate, lang)}</div>
        </div>
      </Link>

      {/* the owner's actions */}
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2.5">
        <Link href={href(`/trips/${trip.id}/edit`)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-navy hover:bg-mist">
          <Pencil size={14} aria-hidden />
          {t.trip.edit}
        </Link>
        {trip.status === "open" ? (
          <button type="button" onClick={() => setTripStatus(trip.id, "full")} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-mint hover:bg-mint-soft">
            <PartyPopper size={14} aria-hidden />
            {t.my.foundPartners}
          </button>
        ) : (
          <button type="button" onClick={() => setTripStatus(trip.id, "open")} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-navy hover:bg-mist">
            <RotateCcw size={14} aria-hidden />
            {t.my.reopen}
          </button>
        )}
        {confirmDelete ? (
          <span className="ms-auto inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                deleteTrip(trip.id);
                toast(t.my.deleted);
              }}
              className="rounded-full bg-coral px-3 py-1.5 text-xs font-bold text-white"
            >
              {t.my.delete}
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-full px-2 py-1.5 text-xs font-semibold text-muted">
              {t.moderation.cancel}
            </button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirmDelete(true)} className="ms-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-coral hover:bg-coral/10">
            <Trash2 size={14} aria-hidden />
            {t.my.delete}
          </button>
        )}
      </div>
      {confirmDelete && <p className="px-4 pb-2 text-xs text-coral">{t.my.confirmDelete}</p>}

      <div className="perforation" />

      <div className="px-4 py-3.5">
        <h3 className="text-sm font-bold text-muted">
          {t.my.incoming} ({incoming.length})
        </h3>
        {incoming.length === 0 && <p className="mt-2 text-sm text-muted">{t.my.noRequests}</p>}

        {locked && pending > 0 && (
          <div className="mt-3 rounded-2xl bg-gradient-to-br from-navy to-navy-2 p-3.5 text-white">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Lock size={16} aria-hidden />
              {t.my.locked}
            </p>
            <button type="button" onClick={() => setPaying(true)} className="mt-3 w-full rounded-xl bg-white py-2.5 text-sm font-bold text-navy">
              {t.my.unlock}
            </button>
          </div>
        )}

        <ul className="mt-3 space-y-2.5">
          {incoming.map((r) => (
            <RequestRow key={r.id} request={r} locked={locked} onRespond={respond} pointsOf={(id) => findUser(users, id)?.stats.points ?? 0} />
          ))}
        </ul>
      </div>

      {paying && (
        <Sheet onClose={() => setPaying(false)} labelledBy="pay-title">
          <h2 id="pay-title" className="mb-4 text-xl font-bold text-ink">
            {t.payment.title}
          </h2>
          <PaymentPanel
            trip={trip}
            onPay={() => {
              closeTrip(trip.id);
              setPaying(false);
              toast(t.payment.done);
            }}
            onBack={() => setPaying(false)}
          />
        </Sheet>
      )}
    </section>
  );
}

function RequestRow({
  request,
  locked,
  onRespond,
  pointsOf,
}: {
  request: JoinRequest;
  locked: boolean;
  onRespond: (id: string, status: Exclude<RequestStatus, "pending">) => void;
  pointsOf: (userId: string) => number;
}) {
  const { t, href } = useT();
  const from = useApp((s) => findUser(s.users, request.fromUserId))!;

  return (
    <li className="rounded-2xl bg-mist p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          {locked ? (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-muted ring-1 ring-line">
              <Lock size={15} aria-hidden />
            </span>
          ) : (
            <Avatar id={from.avatar} size={36} />
          )}
          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="truncate font-semibold text-ink">{from.nickname}</span>
              {!locked && <PointsPill points={pointsOf(from.id)} compact />}
            </span>
            {!locked && (
              <span className="block truncate text-xs text-muted">
                {from.city}
              </span>
            )}
          </span>
        </span>
        <StatusPill status={request.status} />
      </div>
      <p className="mt-2.5 text-sm font-semibold text-navy">
        {t.partyText(request.party)}
        {request.party.type === "group" && request.party.note && <span className="font-normal text-muted"> · {request.party.note}</span>}
      </p>
      {!locked && (
        <div className="mt-2">
          {/* who's coming is the request's own answer, above */}
          <ProfileFacts user={from} withParty={false} />
        </div>
      )}
      {request.note && <p className="mt-2.5 border-s-[3px] border-sky/50 ps-2.5 text-sm text-ink">{request.note}</p>}

      {request.status === "pending" && (
        <div className="mt-3 flex gap-2">
          {!locked && (
            <button
              type="button"
              onClick={() => onRespond(request.id, "accepted")}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-navy py-2.5 text-sm font-bold text-white"
            >
              <Check size={16} aria-hidden />
              {t.my.accept}
            </button>
          )}
          <button
            type="button"
            onClick={() => onRespond(request.id, "declined")}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-sm font-semibold text-muted ring-1 ring-line hover:text-ink"
          >
            <X size={16} aria-hidden />
            {t.my.decline}
          </button>
        </div>
      )}
      {request.status === "accepted" && (
        <Link href={href(`/chat/${request.id}`)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-sky">
          <MessageCircle size={16} aria-hidden />
          {t.trip.openChat}
        </Link>
      )}
    </li>
  );
}

function Sent() {
  const { t, href } = useT();
  const { users, trips, requests, meId, respond, closeTrip } = useApp();
  const sent = requests.filter((r) => r.fromUserId === meId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (sent.length === 0) return <Empty text={t.my.emptySent} action={t.my.browse} to="/" />;

  return (
    <ul className="space-y-4">
      {sent.map((r) => {
        const trip = trips.find((tr) => tr.id === r.tripId);
        const owner = trip && findUser(users, trip.ownerId);
        if (!trip || !owner) return null;
        return (
          <li key={r.id} className="overflow-hidden rounded-3xl bg-white shadow-[0_10px_30px_-16px_rgba(11,29,77,0.35)]">
            <Link href={href(`/trips/${trip.id}`)} className="flex items-center gap-3 p-3">
              <span className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                <Photo area={trip.area} photo={trip.photo} seed={trip.id} sizes="64px" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate font-bold text-ink">{trip.place}</span>
                  <StatusPill status={r.status} />
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                  <Avatar id={owner.avatar} size={18} />
                  {owner.nickname}
                  <span>·</span>
                  <KindLabel trip={trip} />
                </span>
              </span>
            </Link>
            <div className="px-4 pb-3">
              <FlightLine trip={trip} />
            </div>
            <div className="perforation" />
            <div className="space-y-3 px-4 py-3">
              <p className="text-sm font-semibold text-navy">
                {t.partyText(r.party)}
                {r.party.type === "group" && r.party.note && <span className="font-normal text-muted"> · {r.party.note}</span>}
              </p>
              {r.note && <p className="border-s-[3px] border-line ps-2.5 text-sm text-muted">{r.note}</p>}
              {r.status === "accepted" && (
                <Link href={href(`/chat/${r.id}`)} className={`${primaryButton} w-full py-3 text-sm`}>
                  <MessageCircle size={16} aria-hidden />
                  {t.trip.openChat}
                </Link>
              )}
              {r.status === "pending" && (
                <button
                  type="button"
                  onClick={() => {
                    // in the demo the owner closes the trip (if needed) and accepts
                    if (trip.kind === "planned") closeTrip(trip.id);
                    respond(r.id, "accepted");
                  }}
                  className="w-full rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-900"
                >
                  {t.demo.simulateAccept}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function KindLabel({ trip }: { trip: Trip }) {
  const { t } = useT();
  return <span className={trip.kind === "closed" ? "font-semibold text-mint" : "font-semibold text-sky"}>{t.kind[trip.kind]}</span>;
}

function StatusPill({ status }: { status: RequestStatus }) {
  const { t } = useT();
  const tone = status === "accepted" ? "bg-mint-soft text-mint" : status === "declined" ? "bg-line text-muted" : "bg-sky-soft text-sky";
  return <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${tone}`}>{t.my.status[status]}</span>;
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, MessageCircle, X } from "lucide-react";
import { Avatar } from "./Avatar";
import { KindBadge, TripDates } from "./TripBits";
import { useT } from "./Providers";
import { isOpen } from "@/lib/dates";
import { findUser, useApp } from "@/lib/store";
import type { JoinRequest, RequestStatus } from "@/lib/types";

export function MyTrips() {
  const { t } = useT();
  const [tab, setTab] = useState<"posts" | "sent">("posts");

  return (
    <div>
      <h1 className="mb-3 text-2xl font-bold text-ink">{t.my.title}</h1>
      <div role="tablist" className="grid grid-cols-2 gap-1 rounded-2xl bg-white p-1 ring-1 ring-line">
        {(["posts", "sent"] as const).map((key) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              tab === key ? "bg-ink text-white" : "text-muted hover:text-ink"
            }`}
          >
            {key === "posts" ? t.my.posts : t.my.sent}
          </button>
        ))}
      </div>
      <div className="mt-4">{tab === "posts" ? <Posted /> : <Sent />}</div>
    </div>
  );
}

function Posted() {
  const { t, href } = useT();
  const { users, trips, requests, meId, today, respond } = useApp();
  const mine = trips.filter((tr) => tr.ownerId === meId).sort((a, b) => a.startDate.localeCompare(b.startDate));

  if (mine.length === 0) return <Empty text={t.my.emptyPosts} action={t.my.postTrip} to="/new" />;

  return (
    <div className="space-y-4">
      {mine.map((trip) => {
        const incoming = requests.filter((r) => r.tripId === trip.id);
        return (
          <section key={trip.id} className="rounded-2xl bg-white ring-1 ring-line">
            <Link href={href(`/trips/${trip.id}`)} className="block p-4">
              <div className="flex items-center justify-between gap-2">
                <KindBadge kind={trip.kind} />
                {!isOpen(trip, today) && <span className="text-xs font-medium text-muted">{t.my.closed}</span>}
              </div>
              <h2 className="mt-2 text-lg font-semibold text-ink">{trip.place}</h2>
              <div className="mt-1 text-sm text-ink">
                <TripDates trip={trip} />
              </div>
            </Link>

            <div className="border-t border-line px-4 py-3">
              <h3 className="text-sm font-semibold text-muted">
                {t.my.incoming} ({incoming.length})
              </h3>
              {incoming.length === 0 && <p className="mt-2 text-sm text-muted">{t.my.noRequests}</p>}
              <ul className="mt-2 space-y-3">
                {incoming.map((r) => {
                  const from = findUser(users, r.fromUserId)!;
                  return (
                    <li key={r.id} className="rounded-xl bg-cream p-3 ring-1 ring-line">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-2">
                          <Avatar id={from.avatar} size={32} />
                          <span className="truncate text-sm">
                            <span className="font-medium text-ink">{from.nickname}</span>
                            <span className="text-muted"> · {from.city}</span>
                          </span>
                        </span>
                        <StatusPill status={r.status} />
                      </div>
                      {r.note && <p className="mt-2 border-s-2 border-brand/40 ps-2.5 text-sm text-ink">{r.note}</p>}
                      <RequestActions request={r} onRespond={respond} />
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function RequestActions({
  request,
  onRespond,
}: {
  request: JoinRequest;
  onRespond: (id: string, status: Exclude<RequestStatus, "pending">) => void;
}) {
  const { t, href } = useT();
  if (request.status === "pending") {
    return (
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onRespond(request.id, "accepted")}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand py-2 text-sm font-semibold text-white hover:bg-brand-strong"
        >
          <Check size={16} aria-hidden />
          {t.my.accept}
        </button>
        <button
          type="button"
          onClick={() => onRespond(request.id, "declined")}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white py-2 text-sm font-semibold text-muted ring-1 ring-line hover:text-ink"
        >
          <X size={16} aria-hidden />
          {t.my.decline}
        </button>
      </div>
    );
  }
  if (request.status === "accepted") {
    return (
      <Link
        href={href(`/chat/${request.id}`)}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand"
      >
        <MessageCircle size={16} aria-hidden />
        {t.trip.openChat}
      </Link>
    );
  }
  return null;
}

function Sent() {
  const { t, href } = useT();
  const { users, trips, requests, meId, respond } = useApp();
  const sent = requests
    .filter((r) => r.fromUserId === meId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (sent.length === 0) return <Empty text={t.my.emptySent} action={t.my.browse} to="/" />;

  return (
    <ul className="space-y-3">
      {sent.map((r) => {
        const trip = trips.find((tr) => tr.id === r.tripId);
        const owner = trip && findUser(users, trip.ownerId);
        if (!trip || !owner) return null;
        return (
          <li key={r.id} className="rounded-2xl bg-white p-4 ring-1 ring-line">
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 text-sm">
                <Avatar id={owner.avatar} size={28} />
                <span className="truncate font-medium text-ink">{owner.nickname}</span>
              </span>
              <StatusPill status={r.status} />
            </div>
            <Link href={href(`/trips/${trip.id}`)} className="mt-2 block text-lg font-semibold text-ink hover:text-brand">
              {trip.place}
            </Link>
            <div className="mt-1 text-sm text-ink">
              <TripDates trip={trip} />
            </div>
            {r.note && <p className="mt-2 border-s-2 border-line ps-2.5 text-sm text-muted">{r.note}</p>}
            {r.status === "accepted" && (
              <Link
                href={href(`/chat/${r.id}`)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
              >
                <MessageCircle size={16} aria-hidden />
                {t.trip.openChat}
              </Link>
            )}
            {r.status === "pending" && (
              <button
                type="button"
                onClick={() => respond(r.id, "accepted")}
                className="mt-3 w-full rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900"
              >
                {t.demo.simulateAccept}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function StatusPill({ status }: { status: RequestStatus }) {
  const { t } = useT();
  const tone =
    status === "accepted"
      ? "bg-brand-soft text-brand-strong"
      : status === "declined"
        ? "bg-line text-muted"
        : "bg-plan-soft text-plan";
  return <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>{t.my.status[status]}</span>;
}

function Empty({ text, action, to }: { text: string; action: string; to: string }) {
  const { href } = useT();
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white/60 px-4 py-10 text-center">
      <p className="text-sm text-muted">{text}</p>
      <Link href={href(to)} className="mt-3 inline-block rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
        {action}
      </Link>
    </div>
  );
}

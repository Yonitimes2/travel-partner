"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, Lock, SendHorizontal } from "lucide-react";
import { Avatar } from "./Avatar";
import { BackLink } from "./TripView";
import { useT } from "./Providers";
import { formatDay, formatTime } from "@/lib/dates";
import { findUser, useApp } from "@/lib/store";
import type { JoinRequest, Message, Trip, User } from "@/lib/types";

interface Conversation {
  request: JoinRequest;
  trip: Trip;
  other: User;
  last?: Message;
}

/** a chat exists only for an accepted request, between the trip's owner and the person who asked */
function useConversations(): Conversation[] {
  const { users, trips, requests, messages, meId } = useApp();
  const list: Conversation[] = [];
  for (const request of requests) {
    if (request.status !== "accepted") continue;
    const trip = trips.find((tr) => tr.id === request.tripId);
    if (!trip) continue;
    const otherId = trip.ownerId === meId ? request.fromUserId : request.fromUserId === meId ? trip.ownerId : null;
    const other = otherId ? findUser(users, otherId) : undefined;
    if (!other) continue;
    const last = messages.filter((m) => m.requestId === request.id).at(-1);
    list.push({ request, trip, other, last });
  }
  return list.sort((a, b) => (b.last?.at ?? b.request.createdAt).localeCompare(a.last?.at ?? a.request.createdAt));
}

export function ChatList() {
  const { t, lang, href } = useT();
  const today = useApp((s) => s.today);
  const conversations = useConversations();

  return (
    <div>
      <h1 className="mb-3 text-2xl font-bold text-ink">{t.chat.title}</h1>
      {conversations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white/60 px-4 py-10 text-center text-sm text-muted">
          {t.chat.empty}
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-line">
          {conversations.map(({ request, trip, other, last }) => {
            const at = last?.at ?? request.createdAt;
            return (
              <li key={request.id} className="border-b border-line last:border-b-0">
                <Link href={href(`/chat/${request.id}`)} className="flex items-center gap-3 p-3.5 hover:bg-cream">
                  <Avatar id={other.avatar} size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-semibold text-ink">{other.nickname}</span>
                      <span className="shrink-0 text-xs text-muted">
                        {at.slice(0, 10) === today ? formatTime(at, lang) : formatDay(at.slice(0, 10), lang)}
                      </span>
                    </span>
                    <span className="block truncate text-xs font-medium text-brand">{trip.place}</span>
                    <span className="block truncate text-sm text-muted">{last?.text ?? t.chat.acceptedLine}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function ChatView({ id }: { id: string }) {
  const { t, lang, href } = useT();
  const { messages, meId, sendMessage } = useApp();
  const conversation = useConversations().find((c) => c.request.id === id);
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);

  const thread = messages.filter((m) => m.requestId === id);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [thread.length]);

  if (!conversation) {
    return (
      <div>
        <BackLink to="/chat" />
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-10 text-muted ring-1 ring-line">
          <Lock size={16} aria-hidden />
          {t.chat.locked}
        </div>
      </div>
    );
  }

  const { request, trip, other } = conversation;
  const requester = request.fromUserId;

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(id, text);
    setText("");
  };

  return (
    <div className="flex min-h-[calc(100dvh-14rem)] flex-col">
      <BackLink to="/chat" />
      <div className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-line">
        <Avatar id={other.avatar} size={40} />
        <div className="min-w-0">
          <div className="font-semibold text-ink">{other.nickname}</div>
          <Link href={href(`/trips/${trip.id}`)} className="block truncate text-xs font-medium text-brand">
            {t.chat.about(trip.place)}
          </Link>
        </div>
      </div>

      <div className="flex-1 space-y-2 py-4">
        {request.note && <Bubble mine={requester === meId} text={request.note} time={formatTime(request.createdAt, lang)} />}
        <p className="flex items-center justify-center gap-1.5 py-1 text-xs text-brand">
          <Check size={14} aria-hidden />
          {t.chat.acceptedLine}
        </p>
        {thread.map((m) => (
          <Bubble key={m.id} mine={m.fromUserId === meId} text={m.text} time={formatTime(m.at, lang)} />
        ))}
        <div ref={end} />
      </div>

      <form onSubmit={send} className="sticky bottom-20 flex items-center gap-2 rounded-full bg-white p-1.5 shadow-md ring-1 ring-line">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.chat.placeholder}
          aria-label={t.chat.placeholder}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-ink outline-none"
        />
        <button
          type="submit"
          aria-label={t.chat.send}
          disabled={!text.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white disabled:opacity-40"
        >
          <SendHorizontal size={18} className="rtl:rotate-180" aria-hidden />
        </button>
      </form>
    </div>
  );
}

function Bubble({ mine, text, time }: { mine: boolean; text: string; time: string }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[15px] leading-snug ${
          mine ? "rounded-ee-md bg-brand text-white" : "rounded-es-md bg-white text-ink ring-1 ring-line"
        }`}
      >
        {text}
        <span className={`mt-0.5 block text-end text-[10px] ${mine ? "text-white/70" : "text-muted"}`}>{time}</span>
      </div>
    </div>
  );
}

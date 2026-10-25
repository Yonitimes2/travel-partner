"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, Lock, SendHorizontal, ShieldCheck } from "lucide-react";
import { Avatar } from "./Avatar";
import { UserActions } from "./Moderation";
import { Photo } from "./Photo";
import { BackButton, Body, Card, Empty, PageHeader } from "./ui";
import { useT } from "./Providers";
import { formatDay, formatTime } from "@/lib/dates";
import { isBlocked } from "@/lib/rules";
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
  const { users, trips, requests, messages, blocks, meId } = useApp();
  const list: Conversation[] = [];
  for (const request of requests) {
    if (request.status !== "accepted") continue;
    const trip = trips.find((tr) => tr.id === request.tripId);
    if (!trip) continue;
    const otherId = trip.ownerId === meId ? request.fromUserId : request.fromUserId === meId ? trip.ownerId : null;
    const other = otherId ? findUser(users, otherId) : undefined;
    if (!other || isBlocked(blocks, meId, other.id)) continue;
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
      <PageHeader title={t.chat.title} />
      <Body>
        {conversations.length === 0 ? (
          <Empty text={t.chat.empty} />
        ) : (
          <ul className="space-y-2.5">
            {conversations.map(({ request, trip, other, last }) => {
              const at = last?.at ?? request.createdAt;
              return (
                <li key={request.id}>
                  <Link href={href(`/chat/${request.id}`)} className="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-[0_6px_20px_-12px_rgba(11,29,77,0.25)] transition hover:shadow-md">
                    <span className="relative shrink-0">
                      <span className="relative block h-14 w-14 overflow-hidden rounded-2xl">
                        <Photo area={trip.area} photo={trip.photo} seed={trip.id} sizes="56px" />
                      </span>
                      <span className="absolute -bottom-1 -end-1 rounded-full ring-2 ring-white">
                        <Avatar id={other.avatar} size={26} />
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate font-bold text-ink">{other.nickname}</span>
                        <span className="shrink-0 text-xs text-muted">
                          {at.slice(0, 10) === today ? formatTime(at, lang) : formatDay(at.slice(0, 10), lang)}
                        </span>
                      </span>
                      <span className="block truncate text-xs font-semibold text-sky">{trip.place}</span>
                      <span className="block truncate text-sm text-muted">{last?.text ?? t.chat.acceptedLine}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Body>
    </div>
  );
}

export function ChatView({ id }: { id: string }) {
  const { t, lang, href } = useT();
  const router = useRouter();
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
      <div className="p-4">
        <BackButton to="/chat" onDark={false} />
        <Card className="mt-4 flex items-center justify-center gap-2 py-10 text-muted">
          <Lock size={16} aria-hidden />
          {t.chat.locked}
        </Card>
      </div>
    );
  }

  const { request, trip, other } = conversation;

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(id, text);
    setText("");
  };

  return (
    <div className="flex min-h-[calc(100dvh-9rem)] flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-3 bg-gradient-to-br from-navy to-navy-2 px-4 py-3 text-white shadow-lg">
        <BackButton to="/chat" />
        <Avatar id={other.avatar} size={40} />
        <div className="min-w-0 flex-1">
          <div className="font-bold">{other.nickname}</div>
          <Link href={href(`/trips/${trip.id}`)} className="block truncate text-xs text-white/75 hover:text-white">
            {t.chat.about(trip.place)}
          </Link>
        </div>
        <UserActions user={other} onBlocked={() => router.push(href("/chat"))} />
      </header>

      <div className="flex-1 space-y-2 px-4 py-4">
        <div className="flex items-center justify-center gap-1.5 rounded-2xl bg-white/70 px-3 py-2 text-xs text-muted">
          <ShieldCheck size={14} className="text-mint" aria-hidden />
          {t.chat.safety} ·
          <Link href={href("/safety")} className="font-semibold text-sky">
            {t.chat.safetyLink}
          </Link>
        </div>
        {request.note && <Bubble mine={request.fromUserId === meId} text={request.note} time={formatTime(request.createdAt, lang)} />}
        <p className="flex items-center justify-center gap-1.5 py-1 text-xs font-semibold text-mint">
          <Check size={14} aria-hidden />
          {t.chat.acceptedLine}
        </p>
        {thread.map((m) => (
          <Bubble key={m.id} mine={m.fromUserId === meId} text={m.text} time={formatTime(m.at, lang)} />
        ))}
        <div ref={end} />
      </div>

      <form onSubmit={send} className="sticky bottom-24 mx-4 flex items-center gap-2 rounded-full bg-white p-1.5 shadow-[0_8px_30px_-10px_rgba(11,29,77,0.35)] ring-1 ring-line">
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
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-white disabled:opacity-35"
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
        className={`max-w-[80%] rounded-3xl px-4 py-2.5 text-[15px] leading-snug ${
          mine ? "rounded-ee-lg bg-navy text-white" : "rounded-es-lg bg-white text-ink shadow-sm"
        }`}
      >
        {text}
        <span className={`mt-0.5 block text-end text-[10px] ${mine ? "text-white/65" : "text-muted"}`}>{time}</span>
      </div>
    </div>
  );
}

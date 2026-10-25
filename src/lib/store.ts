"use client";

import { create } from "zustand";
import { todayISO } from "./dates";
import type { Action } from "./server/schemas";
import type { AppData, Area, JoinRequest, Party, ReportReason, RequestStatus, Trip, TripKind, TripStatus, User, Wanted } from "./types";

/**
 * The app's copy of what the server lets this person see (GET /api/state).
 * Changes show at once and go to the server one at a time (POST /api/action), which answers with the
 * fresh data; the app also asks again every few seconds, so other people's changes show up too.
 */

export type TripInput = Omit<Trip, "id" | "ownerId" | "createdAt" | "status">;
export type ProfilePatch = Partial<
  Pick<User, "nickname" | "avatar" | "fullName" | "phone" | "party" | "ageGroup" | "observance" | "pace" | "city" | "about" | "notify">
>;

/** the trips list's tab and filters; kept while moving between pages, not saved */
export interface FeedFilters {
  kind: TripKind;
  area: Area | "";
  wanted: Wanted | "";
  month: string;
}

interface AppState extends AppData {
  /** false until the first answer from the server */
  ready: boolean;
  /** false when nobody is signed in (the app sends them to /welcome) */
  signedIn: boolean;
  today: string;
  feed: FeedFilters;
  /** the last change the server refused (shown as a message), with a counter so the same one shows again */
  error: { code: string; n: number } | null;

  init: () => Promise<void>;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  setFeed: (patch: Partial<FeedFilters>) => void;

  createTrip: (trip: TripInput) => string;
  updateTrip: (id: string, trip: TripInput) => void;
  /** planned → closed (the paid step that lets the owner accept partners) */
  closeTrip: (id: string) => void;
  setTripStatus: (id: string, status: TripStatus) => void;
  deleteTrip: (id: string) => void;

  askToJoin: (tripId: string, note: string, party: Party) => void;
  respond: (requestId: string, status: Exclude<RequestStatus, "pending">) => void;
  sendMessage: (requestId: string, text: string) => void;

  report: (aboutUserId: string, reason: ReportReason, text: string) => void;
  block: (userId: string) => void;
  unblock: (userId: string) => void;

  updateProfile: (patch: ProfilePatch) => void;

  // the section admin's actions
  approveUser: (userId: string) => void;
  setUserStatus: (userId: string, status: "active" | "suspended") => void;
  handleReport: (reportId: string) => void;
}

/** ids for new things are made here, so the app can show them before the server answers */
const newId = (prefix: string) => {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return `${prefix}-${Array.from(bytes, (b) => (b % 36).toString(36)).join("")}${Date.now().toString(36).slice(-4)}`;
};
const nowISO = () => new Date().toISOString();

const EMPTY: AppData = { meId: "", users: [], trips: [], requests: [], messages: [], reports: [], blocks: [] };

/** changes go to the server one after the other, in the order they were made */
let queue: Promise<void> = Promise.resolve();
let inFlight = 0;
let errors = 0;

export const useApp = create<AppState>()((set, get) => {
  const apply = (data: AppData) => set({ ...data, signedIn: true, ready: true, today: todayISO() });

  const signedOut = () => set({ ...EMPTY, signedIn: false, ready: true, today: todayISO() });

  const fail = (code: string) => set({ error: { code, n: ++errors } });

  /** shows the change at once (`local`), then sends it; the server's answer replaces the local guess */
  const act = (action: Action, local?: (s: AppState) => Partial<AppState>) => {
    if (local) set(local(get()));
    inFlight++;
    queue = queue.then(async () => {
      try {
        const res = await fetch("/api/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action),
        });
        if (res.status === 401) return signedOut();
        const body = await res.json().catch(() => ({ error: "network" }));
        if (!res.ok) {
          fail(body.error ?? "unknown");
          await get().refresh();
        } else apply(body);
      } catch {
        fail("network");
      } finally {
        inFlight--;
      }
    });
  };

  const me = () => get().meId;

  return {
    ...EMPTY,
    ready: false,
    signedIn: false,
    today: "",
    feed: { kind: "closed", area: "", wanted: "", month: "" },
    error: null,

    init: async () => {
      await get().refresh();
    },

    refresh: async () => {
      try {
        const res = await fetch("/api/state", { cache: "no-store" });
        if (res.status === 401) return signedOut();
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as AppData;
        // a change still on its way would be undone by an older picture
        if (inFlight === 0) apply(data);
      } catch {
        // offline for a moment: keep what's shown; the next refresh tries again
        if (!get().ready) set({ ready: true, today: todayISO() });
      }
    },

    signOut: async () => {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      signedOut();
    },

    setFeed: (patch) => set((s) => ({ feed: { ...s.feed, ...patch } })),

    createTrip: (trip) => {
      const id = newId("t");
      act({ type: "createTrip", id, trip }, (s) => ({
        trips: [...s.trips, { ...trip, id, ownerId: me(), status: "open", createdAt: nowISO() }],
      }));
      return id;
    },

    updateTrip: (id, trip) =>
      act({ type: "updateTrip", id, trip }, (s) => ({ trips: s.trips.map((t) => (t.id === id ? { ...t, ...trip } : t)) })),

    // a closed trip's dates are final: the first option stays
    closeTrip: (id) =>
      act({ type: "closeTrip", id }, (s) => ({
        trips: s.trips.map((t) => (t.id === id ? { ...t, kind: "closed", flex: undefined } : t)),
      })),

    setTripStatus: (id, status) =>
      act({ type: "setTripStatus", id, status }, (s) => ({ trips: s.trips.map((t) => (t.id === id ? { ...t, status } : t)) })),

    deleteTrip: (id) =>
      act({ type: "deleteTrip", id }, (s) => {
        const gone = new Set(s.requests.filter((r) => r.tripId === id).map((r) => r.id));
        return {
          trips: s.trips.filter((t) => t.id !== id),
          requests: s.requests.filter((r) => r.tripId !== id),
          messages: s.messages.filter((m) => !gone.has(m.requestId)),
        };
      }),

    askToJoin: (tripId, note, party) => {
      const request: JoinRequest = {
        id: newId("r"),
        tripId,
        fromUserId: me(),
        note: note.trim(),
        party,
        status: "pending",
        createdAt: nowISO(),
      };
      act({ type: "askToJoin", id: request.id, tripId, note: request.note, party }, (s) => ({ requests: [...s.requests, request] }));
    },

    respond: (requestId, status) =>
      act({ type: "respond", requestId, status }, (s) => ({
        requests: s.requests.map((r) => (r.id === requestId ? { ...r, status } : r)),
      })),

    sendMessage: (requestId, text) => {
      const id = newId("m");
      act({ type: "sendMessage", id, requestId, text: text.trim() }, (s) => ({
        messages: [...s.messages, { id, requestId, fromUserId: s.meId, text: text.trim(), at: nowISO() }],
      }));
    },

    report: (aboutUserId, reason, text) => act({ type: "report", id: newId("rep"), aboutUserId, reason, text: text.trim() }),

    block: (who) =>
      act({ type: "block", userId: who }, (s) =>
        s.blocks.some((b) => b.by === s.meId && b.who === who) ? {} : { blocks: [...s.blocks, { by: s.meId, who }] },
      ),

    unblock: (who) => act({ type: "unblock", userId: who }, (s) => ({ blocks: s.blocks.filter((b) => !(b.by === s.meId && b.who === who)) })),

    updateProfile: (patch) =>
      act({ type: "updateProfile", patch }, (s) => ({ users: s.users.map((u) => (u.id === s.meId ? { ...u, ...patch } : u)) })),

    approveUser: (userId) => get().setUserStatus(userId, "active"),

    setUserStatus: (userId, status) =>
      act({ type: "setUserStatus", userId, status }, (s) => ({ users: s.users.map((u) => (u.id === userId ? { ...u, status } : u)) })),

    handleReport: (reportId) =>
      act({ type: "handleReport", reportId }, (s) => ({
        reports: s.reports.map((r) => (r.id === reportId ? { ...r, status: "handled" } : r)),
      })),
  };
});

export const findUser = (users: User[], id: string) => users.find((u) => u.id === id);

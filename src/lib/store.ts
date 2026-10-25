"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { todayISO } from "./dates";
import { DEMO_MAN, makeSeed, type SeedData } from "./seed";
import type { Area, JoinRequest, ReportReason, RequestStatus, Trip, TripKind, TripStatus, User, Wanted } from "./types";

/**
 * The prototype's whole "backend": sample data in the browser (localStorage).
 * It loads after the page mounts (skipHydration), so nothing date- or storage-dependent runs on the server.
 */

export type TripInput = Omit<Trip, "id" | "ownerId" | "createdAt" | "status">;
export type ProfilePatch = Partial<
  Pick<User, "nickname" | "avatar" | "travelsAs" | "ageGroup" | "observance" | "pace" | "city" | "about" | "notify">
>;
export type SignUp = Pick<
  User,
  "nickname" | "avatar" | "gender" | "travelsAs" | "ageGroup" | "observance" | "pace" | "city" | "about" | "referredBy"
>;

/** the trips list's tab and filters; kept while moving between pages, not saved */
export interface FeedFilters {
  kind: TripKind;
  area: Area | "";
  wanted: Wanted | "";
  month: string;
}

interface AppState extends SeedData {
  /** false until the data is loaded in the browser */
  ready: boolean;
  today: string;
  /** who you are in the prototype (the "view as" switch, or someone who just signed up) */
  meId: string;
  feed: FeedFilters;

  init: () => Promise<void>;
  viewAs: (userId: string) => void;
  setFeed: (patch: Partial<FeedFilters>) => void;

  createTrip: (trip: TripInput) => string;
  updateTrip: (id: string, trip: TripInput) => void;
  /** planned → closed (the paid step that lets the owner accept partners) */
  closeTrip: (id: string) => void;
  setTripStatus: (id: string, status: TripStatus) => void;
  deleteTrip: (id: string) => void;

  askToJoin: (tripId: string, note: string, party: number) => void;
  respond: (requestId: string, status: Exclude<RequestStatus, "pending">) => void;
  sendMessage: (requestId: string, text: string) => void;

  report: (aboutUserId: string, reason: ReportReason, text: string) => void;
  block: (userId: string) => void;
  unblock: (userId: string) => void;

  updateProfile: (patch: ProfilePatch) => void;
  signUp: (data: SignUp) => string;

  // the section admin's actions
  approveUser: (userId: string) => void;
  setUserStatus: (userId: string, status: User["status"]) => void;
  handleReport: (reportId: string) => void;

  reset: () => void;
}

const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
const nowISO = () => new Date().toISOString();

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      ready: false,
      today: "",
      meId: DEMO_MAN,
      users: [],
      trips: [],
      requests: [],
      messages: [],
      reports: [],
      blocks: [],
      feed: { kind: "closed", area: "", wanted: "", month: "" },

      init: async () => {
        await useApp.persist.rehydrate();
        const today = todayISO();
        if (get().users.length === 0) set({ ...makeSeed(today, new Date()), meId: DEMO_MAN });
        set({ ready: true, today });
      },

      viewAs: (meId) => set((s) => ({ meId, feed: { ...s.feed, area: "", wanted: "", month: "" } })),

      setFeed: (patch) => set((s) => ({ feed: { ...s.feed, ...patch } })),

      createTrip: (trip) => {
        const id = newId("t");
        set((s) => ({ trips: [...s.trips, { ...trip, id, ownerId: s.meId, status: "open", createdAt: nowISO() }] }));
        return id;
      },

      updateTrip: (id, trip) => set((s) => ({ trips: s.trips.map((t) => (t.id === id ? { ...t, ...trip } : t)) })),

      // a closed trip's dates are final: the first option stays
      closeTrip: (id) =>
        set((s) => ({ trips: s.trips.map((t) => (t.id === id ? { ...t, kind: "closed", flex: undefined } : t)) })),

      setTripStatus: (id, status) => set((s) => ({ trips: s.trips.map((t) => (t.id === id ? { ...t, status } : t)) })),

      deleteTrip: (id) =>
        set((s) => {
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
          fromUserId: get().meId,
          note: note.trim(),
          party,
          status: "pending",
          createdAt: nowISO(),
        };
        set((s) => ({ requests: [...s.requests, request] }));
      },

      respond: (requestId, status) =>
        set((s) => ({ requests: s.requests.map((r) => (r.id === requestId ? { ...r, status } : r)) })),

      sendMessage: (requestId, text) =>
        set((s) => ({
          messages: [...s.messages, { id: newId("m"), requestId, fromUserId: s.meId, text: text.trim(), at: nowISO() }],
        })),

      report: (aboutUserId, reason, text) =>
        set((s) => ({
          reports: [
            ...s.reports,
            { id: newId("rep"), fromUserId: s.meId, aboutUserId, reason, text: text.trim(), status: "open", createdAt: nowISO() },
          ],
        })),

      block: (who) =>
        set((s) => (s.blocks.some((b) => b.by === s.meId && b.who === who) ? s : { blocks: [...s.blocks, { by: s.meId, who }] })),

      unblock: (who) => set((s) => ({ blocks: s.blocks.filter((b) => !(b.by === s.meId && b.who === who)) })),

      updateProfile: (patch) => set((s) => ({ users: s.users.map((u) => (u.id === s.meId ? { ...u, ...patch } : u)) })),

      signUp: (data) => {
        const id = newId("u");
        const user: User = {
          ...data,
          id,
          status: "pending",
          history: { trips: 0, joined: 0 },
          notify: { push: true, email: false },
          createdAt: nowISO(),
        };
        set((s) => ({ users: [...s.users, user] }));
        return id;
      },

      approveUser: (userId) => get().setUserStatus(userId, "active"),

      setUserStatus: (userId, status) =>
        set((s) => ({ users: s.users.map((u) => (u.id === userId ? { ...u, status } : u)) })),

      handleReport: (reportId) =>
        set((s) => ({ reports: s.reports.map((r) => (r.id === reportId ? { ...r, status: "handled" } : r)) })),

      reset: () => set({ ...makeSeed(todayISO(), new Date()), meId: DEMO_MAN }),
    }),
    {
      // v4: date options on planned trips
      name: "travel-partner-demo-v4",
      skipHydration: true,
      partialize: ({ users, trips, requests, messages, reports, blocks, meId }) => ({
        users,
        trips,
        requests,
        messages,
        reports,
        blocks,
        meId,
      }),
    },
  ),
);

export const findUser = (users: User[], id: string) => users.find((u) => u.id === id);

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { todayISO } from "./dates";
import { DEMO_MAN, makeSeed, type SeedData } from "./seed";
import type { Area, JoinRequest, RequestStatus, Trip, TripKind, User, Wanted } from "./types";

/**
 * The prototype's whole "backend": sample data in the browser (localStorage).
 * It loads after the page mounts (skipHydration), so nothing date- or storage-dependent runs on the server.
 */

export type NewTrip = Omit<Trip, "id" | "ownerId" | "createdAt">;
/** the trips list's tab and filters; kept while moving between pages, not saved */
export interface FeedFilters {
  kind: TripKind;
  area: Area | "";
  wanted: Wanted | "";
  month: string;
}

export type ProfilePatch = Partial<Pick<User, "nickname" | "avatar" | "travelsAs" | "city" | "about">>;

interface AppState extends SeedData {
  /** false until the data is loaded in the browser */
  ready: boolean;
  today: string;
  /** who you are in the prototype (the "view as" switch) */
  meId: string;
  feed: FeedFilters;

  init: () => Promise<void>;
  viewAs: (userId: string) => void;
  setFeed: (patch: Partial<FeedFilters>) => void;
  createTrip: (trip: NewTrip) => string;
  askToJoin: (tripId: string, note: string) => void;
  respond: (requestId: string, status: Exclude<RequestStatus, "pending">) => void;
  sendMessage: (requestId: string, text: string) => void;
  updateProfile: (patch: ProfilePatch) => void;
  reset: () => void;
}

const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

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
      feed: { kind: "booked", area: "", wanted: "", month: "" },

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
        set((s) => ({ trips: [...s.trips, { ...trip, id, ownerId: s.meId, createdAt: new Date().toISOString() }] }));
        return id;
      },

      askToJoin: (tripId, note) => {
        const request: JoinRequest = {
          id: newId("r"),
          tripId,
          fromUserId: get().meId,
          note: note.trim(),
          status: "pending",
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ requests: [...s.requests, request] }));
      },

      respond: (requestId, status) =>
        set((s) => ({ requests: s.requests.map((r) => (r.id === requestId ? { ...r, status } : r)) })),

      sendMessage: (requestId, text) =>
        set((s) => ({
          messages: [
            ...s.messages,
            { id: newId("m"), requestId, fromUserId: s.meId, text: text.trim(), at: new Date().toISOString() },
          ],
        })),

      updateProfile: (patch) =>
        set((s) => ({ users: s.users.map((u) => (u.id === s.meId ? { ...u, ...patch } : u)) })),

      reset: () => set({ ...makeSeed(todayISO(), new Date()), meId: DEMO_MAN }),
    }),
    {
      name: "travel-partner-demo-v1",
      skipHydration: true,
      partialize: ({ users, trips, requests, messages, meId }) => ({ users, trips, requests, messages, meId }),
    },
  ),
);

export const findUser = (users: User[], id: string) => users.find((u) => u.id === id);

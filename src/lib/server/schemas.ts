import { z } from "zod";
import type { AgeGroup, Area, AvatarId, Observance, Pace, PhotoId, ReportReason, TripStyle, Wanted } from "../types";

/** What the server accepts from the app. Everything a person sends is checked here first. */

const AREAS = ["north", "center", "jerusalem", "south", "europe", "usa", "asia", "other"] as const satisfies readonly Area[];
const STYLES = ["hiking", "nature", "cities", "relaxed", "adventure", "shabbat", "food"] as const satisfies readonly TripStyle[];
const WANTED = ["one", "few", "families"] as const satisfies readonly Wanted[];
const AGE_GROUPS = ["18-25", "26-35", "36-50", "50+"] as const satisfies readonly AgeGroup[];
const OBSERVANCE = ["strict", "kosher", "traditional"] as const satisfies readonly Observance[];
const PACES = ["easy", "medium", "hard"] as const satisfies readonly Pace[];
const REASONS = ["behavior", "fake", "spam", "other"] as const satisfies readonly ReportReason[];
const AVATARS = [
  "backpack", "mountain", "tent", "compass", "camel", "wave", "tree", "bike", "plane", "jeep", "camera", "sun",
] as const satisfies readonly AvatarId[];
const PHOTOS = [
  "north-kinneret", "north-golan-vineyard", "north-golan-flowers", "center-caesarea", "center-jaffa",
  "jerusalem-citadel-view", "jerusalem-citadel-walls", "south-ramon", "south-eilat", "south-negev",
  "europe-carezza", "europe-seceda", "europe-swiss-lake", "europe-prague", "usa-manhattan", "usa-empire-state",
  "asia-halong", "asia-halong-sunset", "other-wing-sunset", "other-wing-clouds",
] as const satisfies readonly PhotoId[];

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
/** ids the app makes for new things: a short prefix and random letters */
const newId = (prefix: string) => z.string().regex(new RegExp(`^${prefix}-[a-z0-9]{8,24}$`));
const id = z.string().min(1).max(40);
const text = (max: number) => z.string().trim().max(max);

export const party = z.discriminatedUnion("type", [
  z.object({ type: z.literal("solo") }),
  z.object({ type: z.literal("group"), others: z.number().int().min(0).max(20), note: text(80) }),
  z.object({ type: z.literal("family"), parents: z.union([z.literal(1), z.literal(2)]), kids: z.number().int().min(0).max(15) }),
]);

export const phone = z.string().refine((p) => /^0?5\d{8}$/.test(p.replace(/\D/g, "")));
export const fullName = text(60).refine((n) => n.split(/\s+/).length >= 2);

const tripInput = z.object({
  kind: z.enum(["planned", "closed"]),
  place: text(120).min(1),
  area: z.enum(AREAS),
  photo: z.enum(PHOTOS).optional(),
  startDate: day,
  endDate: day,
  flex: z
    .discriminatedUnion("type", [
      z.object({ type: z.literal("fixed") }),
      z.object({ type: z.literal("alt"), startDate: day }),
      z.object({ type: z.literal("range"), days: z.number().int().min(1).max(90) }),
    ])
    .optional(),
  wanted: z.enum(WANTED),
  styles: z.array(z.enum(STYLES)).max(STYLES.length),
  description: text(2000),
  deadline: z.discriminatedUnion("type", [
    z.object({ type: z.literal("date"), date: day }),
    z.object({ type: z.literal("daysBefore"), days: z.number().int().min(0).max(365) }),
  ]),
});
export type TripInputParsed = z.infer<typeof tripInput>;

const profile = {
  nickname: text(24).min(1),
  avatar: z.enum(AVATARS),
  fullName,
  phone,
  party,
  ageGroup: z.enum(AGE_GROUPS),
  observance: z.enum(OBSERVANCE),
  pace: z.enum(PACES),
  city: text(40),
  about: text(200),
};

export const signUp = z.object({
  ...profile,
  gender: z.enum(["male", "female"]),
  referral: z.object({ name: text(60), phone: z.string().max(20) }).optional(),
  lang: z.enum(["he", "en"]),
});

export const action = z.discriminatedUnion("type", [
  z.object({ type: z.literal("createTrip"), id: newId("t"), trip: tripInput }),
  z.object({ type: z.literal("updateTrip"), id, trip: tripInput }),
  z.object({ type: z.literal("closeTrip"), id }),
  z.object({ type: z.literal("setTripStatus"), id, status: z.enum(["open", "full"]) }),
  z.object({ type: z.literal("deleteTrip"), id }),

  z.object({ type: z.literal("askToJoin"), id: newId("r"), tripId: id, note: text(200), party }),
  z.object({ type: z.literal("respond"), requestId: id, status: z.enum(["accepted", "declined"]) }),
  z.object({ type: z.literal("sendMessage"), id: newId("m"), requestId: id, text: text(1000).min(1) }),

  z.object({ type: z.literal("report"), id: newId("rep"), aboutUserId: id, reason: z.enum(REASONS), text: text(300) }),
  z.object({ type: z.literal("block"), userId: id }),
  z.object({ type: z.literal("unblock"), userId: id }),

  z.object({
    type: z.literal("updateProfile"),
    patch: z.object({ ...profile, notify: z.object({ push: z.boolean(), email: z.boolean() }) }).partial(),
  }),

  z.object({ type: z.literal("setUserStatus"), userId: id, status: z.enum(["active", "suspended"]) }),
  z.object({ type: z.literal("handleReport"), reportId: id }),
]);
export type Action = z.infer<typeof action>;

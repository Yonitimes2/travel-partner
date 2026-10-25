export type Lang = "he" | "en";

/** each person sees their own gender's section; trips looking for families show in both */
export type Gender = "male" | "female";

/** planned: an idea, free; closed: going ahead, paid — only a closed trip can accept partners */
export type TripKind = "planned" | "closed";

/** open: taking requests; full: the owner found partners and stopped new requests */
export type TripStatus = "open" | "full";

export type Wanted = "one" | "few" | "families";

export type Area = "north" | "center" | "jerusalem" | "south" | "europe" | "usa" | "asia" | "other";

export type TripStyle = "hiking" | "nature" | "cities" | "relaxed" | "adventure" | "shabbat" | "food";

/** who someone travels with: alone, with other people (how many is optional, plus a note), or a family */
export type Party =
  | { type: "solo" }
  | { type: "group"; others: number; note: string }
  | { type: "family"; parents: 1 | 2; kids: number };

export type PhotoId =
  | "north-kinneret"
  | "north-golan-vineyard"
  | "north-golan-flowers"
  | "center-caesarea"
  | "center-jaffa"
  | "jerusalem-citadel-view"
  | "jerusalem-citadel-walls"
  | "south-ramon"
  | "south-eilat"
  | "south-negev"
  | "europe-carezza"
  | "europe-seceda"
  | "europe-swiss-lake"
  | "europe-prague"
  | "usa-manhattan"
  | "usa-empire-state"
  | "asia-halong"
  | "asia-halong-sunset"
  | "other-wing-sunset"
  | "other-wing-clouds";

export type AgeGroup = "18-25" | "26-35" | "36-50" | "50+";

/** how strictly kashrut and Shabbat are kept on a trip */
export type Observance = "strict" | "kosher" | "traditional";

export type Pace = "easy" | "medium" | "hard";

/** pending: signed up and waiting for the recommender and the section's admin */
export type UserStatus = "pending" | "active" | "suspended";

/**
 * How settled a planned trip's dates are: only these dates, a second departure date, or flexible by some days.
 * A closed trip's dates are final.
 */
export type DateFlex =
  | { type: "fixed" }
  | { type: "alt"; startDate: string }
  | { type: "range"; days: number };

/** until when the poster is looking for partners: a fixed date, or a number of days before the trip */
export type Deadline = { type: "date"; date: string } | { type: "daysBefore"; days: number };

export type AvatarId =
  | "backpack"
  | "mountain"
  | "tent"
  | "compass"
  | "camel"
  | "wave"
  | "tree"
  | "bike"
  | "plane"
  | "jeep"
  | "camera"
  | "sun";

export interface User {
  id: string;
  nickname: string;
  avatar: AvatarId;
  gender: Gender;
  /** private: only the section's admins see the full name and phone */
  fullName: string;
  phone: string;
  party: Party;
  ageGroup: AgeGroup;
  observance: Observance;
  pace: Pace;
  city: string;
  about: string;
  status: UserStatus;
  /** the existing member who recommended them (found by the phone they gave) */
  referredBy?: string;
  /** the recommender's full name and phone as typed at sign-up, for the admins to check */
  referral?: { name: string; phone: string };
  /** trips and partners from before the data in this prototype, so the points have history */
  history: { trips: number; joined: number };
  notify: { push: boolean; email: boolean };
  createdAt: string;
}

export interface Trip {
  id: string;
  ownerId: string;
  kind: TripKind;
  status: TripStatus;
  area: Area;
  /** free text, e.g. "הדולומיטים, צפון איטליה" */
  place: string;
  /** the cover photo; without one, a photo of the area is picked */
  photo?: PhotoId;
  /** yyyy-mm-dd */
  startDate: string;
  endDate: string;
  /** planned trips only; missing means the dates are fixed */
  flex?: DateFlex;
  wanted: Wanted;
  styles: TripStyle[];
  description: string;
  deadline: Deadline;
  createdAt: string;
}

export type RequestStatus = "pending" | "accepted" | "declined";

export interface JoinRequest {
  id: string;
  tripId: string;
  fromUserId: string;
  /** the short note sent with the request; the only text allowed before the owner accepts */
  note: string;
  /** who is coming */
  party: Party;
  status: RequestStatus;
  createdAt: string;
}

/** messages belong to an accepted request: that is the only way two people can talk */
export interface Message {
  id: string;
  requestId: string;
  fromUserId: string;
  text: string;
  at: string;
}

export type ReportReason = "behavior" | "fake" | "spam" | "other";

export interface Report {
  id: string;
  fromUserId: string;
  aboutUserId: string;
  reason: ReportReason;
  text: string;
  status: "open" | "handled";
  createdAt: string;
}

export interface Block {
  by: string;
  who: string;
}

export type Lang = "he" | "en";

/** each person only sees trips posted by people of the same gender */
export type Gender = "male" | "female";

/** planned: an idea that depends on finding partners (free); booked: already booked, partners optional (paid) */
export type TripKind = "planned" | "booked";

export type Wanted = "one" | "few" | "families";

export type Area = "north" | "center" | "jerusalem" | "south" | "europe" | "usa" | "asia" | "other";

export type TripStyle = "hiking" | "nature" | "cities" | "relaxed" | "adventure" | "shabbat" | "food";

export type TravelsAs = "solo" | "family";

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
  travelsAs: TravelsAs;
  city: string;
  about: string;
}

export interface Trip {
  id: string;
  ownerId: string;
  kind: TripKind;
  area: Area;
  /** free text, e.g. "הדולומיטים, צפון איטליה" */
  place: string;
  /** yyyy-mm-dd */
  startDate: string;
  endDate: string;
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

import { PHOTO_FILES, PHOTO_WIDTHS } from "./photo-files";
import type { Area, PhotoId } from "./types";

/**
 * Destination photos from Unsplash (free to use under the Unsplash License). The originals are in
 * src/assets/photos; every size the app shows is made ahead of time (photo-files.ts, npm run photos).
 */
export interface Photo {
  area: Area;
  /** the photo's page on Unsplash */
  unsplash: string;
  by?: string;
}

const photo = (area: Area, id: string, by?: string): Photo => ({
  area,
  unsplash: `https://unsplash.com/photos/${id}`,
  by,
});

export const PHOTOS: Record<PhotoId, Photo> = {
  "north-kinneret": photo("north", "f9fJ6nxndoo", "Chris Gallimore"),
  "north-golan-vineyard": photo("north", "ExrYzDFVmMA"),
  "north-golan-flowers": photo("north", "g_Abgn1slAM", "Aviv Ben Or"),
  "center-caesarea": photo("center", "F7KvvDP1qvQ"),
  "center-jaffa": photo("center", "yBJuiaMHlsk", "Shai Pal"),
  "jerusalem-citadel-view": photo("jerusalem", "YGTfs3dmZcM", "George"),
  "jerusalem-citadel-walls": photo("jerusalem", "vFemw6zXlNI", "Ilanit Ohana"),
  "south-ramon": photo("south", "Z4N3j6heFKU", "Or Hakim"),
  "south-eilat": photo("south", "1o-ymZCEN3c", "Gregory Atkats"),
  "south-negev": photo("south", "fVhbskt01OQ", "Benjamin R."),
  "europe-carezza": photo("europe", "sC-BXbi9ajw", "Ricardo Frantz"),
  "europe-seceda": photo("europe", "p7S6AxykCl0"),
  "europe-swiss-lake": photo("europe", "kJF5c9ZKHuE", "The Quiet Atlas"),
  "europe-prague": photo("europe", "6En4WYsNYXM"),
  "usa-manhattan": photo("usa", "_QdFx92MO2U"),
  "usa-empire-state": photo("usa", "5omwAMDxmkU"),
  "asia-halong": photo("asia", "kG7pOXbBfNs"),
  "asia-halong-sunset": photo("asia", "wTJQjCQm90k"),
  "other-wing-sunset": photo("other", "pEZ9uGCEdF4", "Astra Liu"),
  "other-wing-clouds": photo("other", "QAemWFs90tU"),
};

export const PHOTO_IDS = Object.keys(PHOTOS) as PhotoId[];

/** the home screen's photo when no area is chosen: one of these, a different one each day */
export const HERO_PHOTOS: PhotoId[] = ["europe-carezza", "asia-halong", "center-caesarea", "south-ramon", "europe-seceda"];

/** today's home photo; the page's <head> works out the same one to start downloading it early */
export const heroOfDay = (today: string) => HERO_PHOTOS[Number(today.replaceAll("-", "")) % HERO_PHOTOS.length];

/** "…-128.avif 128w, …-256.avif 256w, …" for one photo and format */
export const photoSrcSet = (id: PhotoId, ext: "avif" | "webp") =>
  PHOTO_WIDTHS.map((w) => `${PHOTO_FILES[id].base}-${w}.${ext} ${w}w`).join(", ");

/** how wide a full-width photo shows: the whole phone, or the app's column on a computer */
export const FULL_WIDTH = "(max-width: 448px) 100vw, 448px";

export const photosOf = (area: Area) => PHOTO_IDS.filter((id) => PHOTOS[id].area === area);

/** the trip's chosen cover, or one of its area's photos picked steadily by `seed` (so a trip keeps its photo) */
export function pickPhoto(area: Area, photo?: PhotoId, seed = ""): PhotoId {
  if (photo && PHOTOS[photo]) return photo;
  const list = photosOf(area);
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return list[Math.abs(hash) % list.length];
}

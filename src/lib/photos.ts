import type { StaticImageData } from "next/image";
import type { Area, PhotoId } from "./types";

import northKinneret from "@/assets/photos/north-kinneret.jpg";
import northGolanVineyard from "@/assets/photos/north-golan-vineyard.jpg";
import northGolanFlowers from "@/assets/photos/north-golan-flowers.jpg";
import centerCaesarea from "@/assets/photos/center-caesarea.jpg";
import centerJaffa from "@/assets/photos/center-jaffa.jpg";
import jerusalemCitadelView from "@/assets/photos/jerusalem-citadel-view.jpg";
import jerusalemCitadelWalls from "@/assets/photos/jerusalem-citadel-walls.jpg";
import southRamon from "@/assets/photos/south-ramon.jpg";
import southEilat from "@/assets/photos/south-eilat.jpg";
import southNegev from "@/assets/photos/south-negev.jpg";
import europeCarezza from "@/assets/photos/europe-carezza.jpg";
import europeSeceda from "@/assets/photos/europe-seceda.jpg";
import europeSwissLake from "@/assets/photos/europe-swiss-lake.jpg";
import europePrague from "@/assets/photos/europe-prague.jpg";
import usaManhattan from "@/assets/photos/usa-manhattan.jpg";
import usaEmpireState from "@/assets/photos/usa-empire-state.jpg";
import asiaHalong from "@/assets/photos/asia-halong.jpg";
import asiaHalongSunset from "@/assets/photos/asia-halong-sunset.jpg";
import otherWingSunset from "@/assets/photos/other-wing-sunset.jpg";
import otherWingClouds from "@/assets/photos/other-wing-clouds.jpg";

/**
 * Destination photos from Unsplash (free to use under the Unsplash License), resized to 1600px.
 * next/image serves each screen a small AVIF/WebP copy, with a blurred preview while it loads.
 */
export interface Photo {
  src: StaticImageData;
  area: Area;
  /** the photo's page on Unsplash */
  unsplash: string;
  by?: string;
}

const photo = (src: StaticImageData, area: Area, id: string, by?: string): Photo => ({
  src,
  area,
  unsplash: `https://unsplash.com/photos/${id}`,
  by,
});

export const PHOTOS: Record<PhotoId, Photo> = {
  "north-kinneret": photo(northKinneret, "north", "f9fJ6nxndoo", "Chris Gallimore"),
  "north-golan-vineyard": photo(northGolanVineyard, "north", "ExrYzDFVmMA"),
  "north-golan-flowers": photo(northGolanFlowers, "north", "g_Abgn1slAM", "Aviv Ben Or"),
  "center-caesarea": photo(centerCaesarea, "center", "F7KvvDP1qvQ"),
  "center-jaffa": photo(centerJaffa, "center", "yBJuiaMHlsk", "Shai Pal"),
  "jerusalem-citadel-view": photo(jerusalemCitadelView, "jerusalem", "YGTfs3dmZcM", "George"),
  "jerusalem-citadel-walls": photo(jerusalemCitadelWalls, "jerusalem", "vFemw6zXlNI", "Ilanit Ohana"),
  "south-ramon": photo(southRamon, "south", "Z4N3j6heFKU", "Or Hakim"),
  "south-eilat": photo(southEilat, "south", "1o-ymZCEN3c", "Gregory Atkats"),
  "south-negev": photo(southNegev, "south", "fVhbskt01OQ", "Benjamin R."),
  "europe-carezza": photo(europeCarezza, "europe", "sC-BXbi9ajw", "Ricardo Frantz"),
  "europe-seceda": photo(europeSeceda, "europe", "p7S6AxykCl0"),
  "europe-swiss-lake": photo(europeSwissLake, "europe", "kJF5c9ZKHuE", "The Quiet Atlas"),
  "europe-prague": photo(europePrague, "europe", "6En4WYsNYXM"),
  "usa-manhattan": photo(usaManhattan, "usa", "_QdFx92MO2U"),
  "usa-empire-state": photo(usaEmpireState, "usa", "5omwAMDxmkU"),
  "asia-halong": photo(asiaHalong, "asia", "kG7pOXbBfNs"),
  "asia-halong-sunset": photo(asiaHalongSunset, "asia", "wTJQjCQm90k"),
  "other-wing-sunset": photo(otherWingSunset, "other", "pEZ9uGCEdF4", "Astra Liu"),
  "other-wing-clouds": photo(otherWingClouds, "other", "QAemWFs90tU"),
};

export const PHOTO_IDS = Object.keys(PHOTOS) as PhotoId[];

export const photosOf = (area: Area) => PHOTO_IDS.filter((id) => PHOTOS[id].area === area);

/** the trip's chosen cover, or one of its area's photos picked steadily by `seed` (so a trip keeps its photo) */
export function pickPhoto(area: Area, photo?: PhotoId, seed = ""): PhotoId {
  if (photo && PHOTOS[photo]) return photo;
  const list = photosOf(area);
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return list[Math.abs(hash) % list.length];
}

import Image from "next/image";
import { PHOTOS, pickPhoto } from "@/lib/photos";
import type { Area, PhotoId } from "@/lib/types";

/**
 * A destination photo that fills its parent (the parent needs a size and `position: relative`).
 * `sizes` tells the browser how wide it shows, so a phone downloads a small copy; `preload` is for the first screen.
 */
export function Photo({
  area,
  photo,
  seed,
  sizes,
  preload = false,
  className = "",
}: {
  area: Area;
  photo?: PhotoId;
  seed?: string;
  sizes: string;
  preload?: boolean;
  className?: string;
}) {
  const p = PHOTOS[pickPhoto(area, photo, seed)];
  return (
    <Image
      src={p.src}
      alt=""
      fill
      sizes={sizes}
      preload={preload}
      placeholder="blur"
      quality={75}
      className={`object-cover ${className}`}
    />
  );
}

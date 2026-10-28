"use client";

import { useState } from "react";
import { preload as preloadImage } from "react-dom";
import { PHOTO_FILES } from "@/lib/photo-files";
import { photoSrcSet as srcSet, pickPhoto } from "@/lib/photos";
import type { Area, PhotoId } from "@/lib/types";

/**
 * A destination photo that fills its parent (the parent needs a size and `position: relative`).
 * Every size was made ahead of time (npm run photos), so the browser only downloads a ready file:
 * AVIF where it can, WebP otherwise, the width that `sizes` says it needs. A blurred preview shows
 * at once and the photo fades in over it; `preload` starts the download before anything else.
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
  const id = pickPhoto(area, photo, seed);
  const files = PHOTO_FILES[id];
  const [loaded, setLoaded] = useState<string | null>(null);

  if (preload) {
    preloadImage(`${files.base}-828.avif`, { as: "image", type: "image/avif", imageSrcSet: srcSet(id, "avif"), imageSizes: sizes, fetchPriority: "high" });
  }

  // a photo already in the browser's cache can finish before React listens for "load"
  const ref = (img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth) setLoaded(id);
  };

  return (
    <span aria-hidden className="absolute inset-0 overflow-hidden">
      {/* the preview: 24 pixels wide, blurred, scaled up a little so its soft edges stay outside */}
      <span
        className="absolute inset-0 scale-110 bg-cover bg-center blur-xl"
        style={{ backgroundImage: `url(${files.blur})` }}
      />
      <picture>
        <source type="image/avif" srcSet={srcSet(id, "avif")} sizes={sizes} />
        <img
          ref={ref}
          src={`${files.base}-828.webp`}
          srcSet={srcSet(id, "webp")}
          sizes={sizes}
          alt=""
          decoding="async"
          loading={preload ? "eager" : "lazy"}
          fetchPriority={preload ? "high" : "auto"}
          onLoad={() => setLoaded(id)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out ${
            loaded === id ? "opacity-100" : "opacity-0"
          } ${className}`}
        />
      </picture>
    </span>
  );
}

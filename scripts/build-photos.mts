/**
 * Makes every size of every destination photo ahead of time, so no photo is ever resized while
 * someone waits: public/photos/<id>.<hash>-<width>.(avif|webp), plus a tiny blurred preview and
 * the list of files in src/lib/photo-files.ts. The name carries a hash of the source, so the files
 * can be cached for a year and a changed photo gets a new name.
 *
 *   npm run photos   (runs by itself before every build; sizes that already exist are skipped)
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

/** the widths the app asks for: round buttons, thumbnails, cards, full-width photos on 2x and 3x screens */
export const WIDTHS = [128, 256, 640, 828, 1200];
const AVIF = { quality: 48, effort: 5 };
const WEBP = { quality: 70, effort: 5 };
/** part of every file name, so new settings make new names (the files are cached for a year) */
const SETTINGS = JSON.stringify({ WIDTHS, AVIF, WEBP });

const SRC = "src/assets/photos";
const OUT = "public/photos";
mkdirSync(OUT, { recursive: true });

const entries: string[] = [];
let made = 0;

for (const file of readdirSync(SRC).filter((f) => f.endsWith(".jpg")).sort()) {
  const id = file.replace(/\.jpg$/, "");
  const source = readFileSync(path.join(SRC, file));
  const hash = createHash("sha1").update(source).update(SETTINGS).digest("hex").slice(0, 8);
  const base = `${id}.${hash}`;
  const { width = 0, height = 0 } = await sharp(source).metadata();

  for (const w of WIDTHS) {
    const avif = path.join(OUT, `${base}-${w}.avif`);
    const webp = path.join(OUT, `${base}-${w}.webp`);
    if (!existsSync(avif)) {
      await sharp(source).resize({ width: w }).avif(AVIF).toFile(avif);
      made++;
    }
    if (!existsSync(webp)) {
      await sharp(source).resize({ width: w }).webp(WEBP).toFile(webp);
      made++;
    }
  }

  // a 24px-wide preview, shown blurred at once while the photo loads
  const blur = await sharp(source).resize({ width: 24 }).webp({ quality: 50 }).toBuffer();
  entries.push(
    `  "${id}": { base: "/photos/${base}", ratio: ${(width / height).toFixed(4)}, blur: "data:image/webp;base64,${blur.toString("base64")}" },`,
  );
}

writeFileSync(
  "src/lib/photo-files.ts",
  `// Made by scripts/build-photos.mts (npm run photos) — don't edit by hand.
import type { PhotoId } from "./types";

export const PHOTO_WIDTHS = ${JSON.stringify(WIDTHS)};

/** each photo's files: \`\${base}-\${width}.avif|webp\`, its shape, and a tiny preview */
export const PHOTO_FILES: Record<PhotoId, { base: string; ratio: number; blur: string }> = {
${entries.join("\n")}
};
`,
);
console.log(`photos: ${entries.length} photos, ${made} new files`);

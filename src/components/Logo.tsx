import { useId } from "react";

// two map pins linked together: two people, one destination (drawn on a 120 by 120 grid)
const LEFT = "M44 90.39L25.88 64.08A22 22 0 1 1 62.12 64.08Z";
const RIGHT = "M76 90.39L57.88 64.08A22 22 0 1 1 94.12 64.08Z";
/** the height of both pins' centers, and where the two crossings are split */
const MID = 51.6;
const GOLD = "#e9c46a";

/** the logo's pins, for dark backgrounds; `tile` puts them on the navy app-icon square */
export function LogoMark({ size = 32, tile = false, className }: { size?: number; tile?: boolean; className?: string }) {
  const id = useId();
  return (
    // the radius matches the tile's corners, so a shadow or ring added from outside follows them
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden className={className} style={tile ? { borderRadius: "22.5%" } : undefined}>
      <defs>
        {tile && (
          <linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#14307a" />
            <stop offset="1" stopColor="#0b1d4d" />
          </linearGradient>
        )}
        {/* each pin is cut where the other passes over it (white on top at the upper crossing, gold at the lower one),
            so the gap shows whatever is behind the logo */}
        <clipPath id={`${id}top`}>
          <rect width="120" height={MID} />
        </clipPath>
        <clipPath id={`${id}bottom`}>
          <rect y={MID} width="120" height={120 - MID} />
        </clipPath>
        <mask id={`${id}left`}>
          <rect width="120" height="120" fill="#fff" />
          <path d={RIGHT} fill="none" stroke="#000" strokeWidth="13" strokeLinejoin="round" clipPath={`url(#${id}bottom)`} />
        </mask>
        <mask id={`${id}right`}>
          <rect width="120" height="120" fill="#fff" />
          <path d={LEFT} fill="none" stroke="#000" strokeWidth="13" strokeLinejoin="round" clipPath={`url(#${id}top)`} />
        </mask>
      </defs>
      {tile && <rect width="120" height="120" rx="27" fill={`url(#${id}bg)`} />}
      <g fill="none" strokeWidth="7" strokeLinejoin="round">
        <path d={LEFT} stroke="#fff" mask={`url(#${id}left)`} />
        <path d={RIGHT} stroke={GOLD} mask={`url(#${id}right)`} />
      </g>
      <circle cx="44" cy={MID} r="4.8" fill="#fff" />
      <circle cx="76" cy={MID} r="4.8" fill={GOLD} />
    </svg>
  );
}

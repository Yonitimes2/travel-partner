import { useId } from "react";
import type { Area } from "@/lib/types";

/**
 * A drawn landscape for each area, used where an airline app would show a destination photo.
 * Self-contained (no image files or outside sites); always fills its box.
 */
export function Scene({ area, className = "" }: { area: Area; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const Art = SCENES[area];
  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden className={className}>
      <Art id={id} />
    </svg>
  );
}

type Art = (props: { id: string }) => React.ReactNode;

const Sky = ({ id, from, to, mid }: { id: string; from: string; to: string; mid?: string }) => (
  <>
    <defs>
      <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={from} />
        {mid && <stop offset="0.55" stopColor={mid} />}
        <stop offset="1" stopColor={to} />
      </linearGradient>
    </defs>
    <rect width="400" height="240" fill={`url(#${id}sky)`} />
  </>
);

const north: Art = ({ id }) => (
  <>
    <Sky id={id} from="#7fc0ec" to="#e8f5fb" />
    <circle cx="300" cy="66" r="22" fill="#fff7dc" opacity="0.9" />
    <path d="M0 150 Q60 108 125 134 T250 124 T400 118 V240 H0Z" fill="#86b796" />
    <path d="M0 172 Q85 128 175 160 T400 148 V240 H0Z" fill="#4f8f69" />
    <path d="M0 196 Q200 182 400 196 V240 H0Z" fill="#58a8cf" />
    <path d="M40 204 H120 M210 210 H300 M150 220 H190" stroke="#fff" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
    <path d="M0 218 Q120 192 235 216 T400 208 V240 H0Z" fill="#2f6b4a" />
    {[300, 318, 334, 352].map((x, i) => (
      <path key={x} d={`M${x} ${212 - (i % 2) * 6} l8 -22 l8 22 Z`} fill="#24573b" />
    ))}
  </>
);

const center: Art = ({ id }) => (
  <>
    <Sky id={id} from="#78bfee" to="#fdebcc" />
    <circle cx="96" cy="118" r="26" fill="#fff1c7" />
    <defs>
      <linearGradient id={`${id}sea`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2b93cc" />
        <stop offset="1" stopColor="#135b93" />
      </linearGradient>
    </defs>
    <rect y="140" width="400" height="100" fill={`url(#${id}sea)`} />
    <path d="M20 160 q15 -5 30 0 M80 175 q15 -5 30 0 M150 158 q15 -5 30 0 M40 198 q15 -5 30 0 M120 210 q15 -5 30 0" stroke="#fff" strokeOpacity="0.4" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M190 240 Q262 168 400 172 V240Z" fill="#f2d6a4" />
    <path d="M190 240 Q262 168 400 172 V180 Q275 180 205 240Z" fill="#e7c18a" />
    <path d="M338 176 C334 150 336 128 344 108" stroke="#7a5a37" strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M344 108 q-22 -2 -34 12 M344 108 q20 -8 34 4 M344 108 q-6 -20 -24 -24 M344 108 q12 -18 30 -16" stroke="#2f7a4f" strokeWidth="6" fill="none" strokeLinecap="round" />
  </>
);

const jerusalem: Art = ({ id }) => (
  <>
    <Sky id={id} from="#f0a05c" mid="#f7c88a" to="#fde6bd" />
    <circle cx="210" cy="150" r="44" fill="#ffe7ad" opacity="0.85" />
    <path d="M0 168 Q100 138 205 160 T400 152 V240 H0Z" fill="#d6a46a" />
    {/* the citadel tower and old-city houses in stone */}
    <rect x="64" y="104" width="34" height="96" fill="#e2bf88" />
    <path d="M64 104 h6 v-7 h6 v7 h5 v-7 h6 v7 h5 v-7 h6 v7" fill="#e2bf88" />
    <rect x="76" y="122" width="10" height="16" rx="5" fill="#a77d47" />
    <rect x="120" y="150" width="54" height="50" fill="#e8c897" />
    <rect x="176" y="138" width="40" height="62" fill="#dcb67e" />
    <rect x="220" y="156" width="62" height="44" fill="#e6c48f" />
    <rect x="286" y="132" width="30" height="68" fill="#d9b076" />
    <path d="M286 132 a15 15 0 0 1 30 0Z" fill="#cfa468" />
    <rect x="320" y="160" width="60" height="40" fill="#e3c18b" />
    {[134, 150, 188, 232, 252, 296, 334, 352].map((x, i) => (
      <rect key={x} x={x} y={i % 2 ? 168 : 176} width="7" height="11" rx="3.5" fill="#a77d47" opacity="0.8" />
    ))}
    {/* the old-city wall */}
    <rect y="196" width="400" height="44" fill="#caa06a" />
    {Array.from({ length: 25 }, (_, i) => (
      <rect key={i} x={i * 16 + 2} y="189" width="9" height="8" fill="#caa06a" />
    ))}
    <path d="M182 240 v-22 a18 18 0 0 1 36 0 v22Z" fill="#8f6739" />
  </>
);

const south: Art = ({ id }) => (
  <>
    <Sky id={id} from="#f39a55" mid="#fbc684" to="#ffe9c4" />
    <circle cx="282" cy="108" r="34" fill="#fff3d1" />
    <path d="M0 160 Q90 118 190 150 T400 138 V240 H0Z" fill="#e9ad68" />
    <path d="M0 190 Q120 148 240 184 T400 172 V240 H0Z" fill="#da8f4a" />
    <path d="M60 170 Q120 158 175 176" stroke="#f3c38a" strokeWidth="2" fill="none" opacity="0.7" />
    <path d="M0 222 Q150 184 300 214 T400 206 V240 H0Z" fill="#c57336" />
    {/* a camel on the far dune */}
    <path d="M88 150 q4 -10 10 -2 q6 -12 12 -1 l6 -6 l3 2 l-4 7 v12 h-3 v-9 h-14 v9 h-3 v-10 Z" fill="#7a4520" opacity="0.75" />
  </>
);

const europe: Art = ({ id }) => (
  <>
    <Sky id={id} from="#93c9fa" to="#eef7ff" />
    <polygon points="0,168 52,112 92,150 142,78 200,150 252,94 312,150 362,104 400,138 400,240 0,240" fill="#93a6c9" />
    <polygon points="126,98 142,78 158,100 148,96 142,104 134,96" fill="#fff" />
    <polygon points="238,110 252,94 266,112 258,108 252,114 245,108" fill="#fff" />
    <polygon points="350,116 362,104 374,118 367,115 362,120 356,115" fill="#fff" />
    <polygon points="0,196 70,140 120,184 180,128 246,190 300,150 360,190 400,170 400,240 0,240" fill="#5f7398" />
    <polygon points="166,142 180,128 194,144 186,141 180,147 173,141" fill="#f4f8ff" />
    <rect y="206" width="400" height="34" fill="#3d6b55" />
    {Array.from({ length: 22 }, (_, i) => (
      <path key={i} d={`M${i * 19 - 4} 214 l9 -${24 + (i % 3) * 6} l9 ${24 + (i % 3) * 6}Z`} fill="#2b5546" />
    ))}
  </>
);

const usa: Art = ({ id }) => (
  <>
    <Sky id={id} from="#0b1d4d" mid="#3a3d8f" to="#f08b7c" />
    {[[30, 20], [90, 36], [150, 14], [240, 30], [320, 18], [370, 44], [200, 50]].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" fill="#fff" opacity="0.7" />
    ))}
    {[
      [10, 140, 36], [50, 120, 30], [84, 150, 26], [114, 96, 34], [152, 132, 28], [184, 70, 30],
      [218, 118, 36], [258, 140, 24], [286, 104, 32], [322, 128, 30], [356, 150, 40],
    ].map(([x, y, w]) => (
      <rect key={x} x={x} y={y} width={w} height={210 - y} fill="#151b3f" />
    ))}
    <rect x="196" y="40" width="6" height="32" fill="#151b3f" />
    {Array.from({ length: 46 }, (_, i) => {
      const x = 16 + ((i * 37) % 370);
      const y = 110 + ((i * 53) % 90);
      return <rect key={i} x={x} y={y} width="4" height="5" fill="#ffd27a" opacity={0.55 + (i % 3) * 0.15} />;
    })}
    <rect y="208" width="400" height="32" fill="#10173a" />
    <path d="M30 220 H90 M140 226 H220 M260 218 H330" stroke="#ffd27a" strokeOpacity="0.35" strokeWidth="2" />
  </>
);

const asia: Art = ({ id }) => (
  <>
    <Sky id={id} from="#9fdcdd" to="#f4fbf5" />
    <path d="M150 200 C146 150 156 112 172 108 C190 104 196 150 192 200Z" fill="#a7cfbf" />
    <path d="M300 200 C296 160 304 128 318 124 C334 122 340 160 336 200Z" fill="#a7cfbf" />
    <rect y="138" width="400" height="16" fill="#fff" opacity="0.35" />
    <path d="M40 204 C34 150 50 100 70 96 C92 92 100 150 96 204Z" fill="#4f8d79" />
    <path d="M220 204 C214 140 232 88 252 86 C276 84 280 150 274 204Z" fill="#5c9b86" />
    <path d="M100 204 C98 170 106 146 118 144 C130 142 134 172 132 204Z" fill="#3f7a67" />
    <path d="M340 204 C336 166 346 138 360 136 C374 134 378 170 376 204Z" fill="#3f7a67" />
    <defs>
      <linearGradient id={`${id}water`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#47aba6" />
        <stop offset="1" stopColor="#2a7d86" />
      </linearGradient>
    </defs>
    <rect y="200" width="400" height="40" fill={`url(#${id}water)`} />
    <path d="M168 222 h44 l-6 8 h-32 Z M188 222 v-16 l12 12" fill="#24414a" stroke="#24414a" strokeWidth="1.5" />
  </>
);

const other: Art = ({ id }) => (
  <>
    <Sky id={id} from="#1d3f91" mid="#3f7be0" to="#a9d4ff" />
    {[[70, 170, 1], [300, 190, 1.3], [210, 120, 0.8]].map(([x, y, s]) => (
      <g key={x} transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" opacity="0.9">
        <circle cx="0" cy="0" r="18" />
        <circle cx="22" cy="-8" r="22" />
        <circle cx="46" cy="0" r="16" />
        <rect x="-18" y="0" width="80" height="16" rx="8" />
      </g>
    ))}
    <path d="M10 210 Q150 160 300 70" stroke="#fff" strokeWidth="2.5" strokeDasharray="6 8" fill="none" opacity="0.8" />
    <g transform="translate(312 62) rotate(-32)" fill="#fff">
      <rect x="-22" y="-4" width="44" height="8" rx="4" />
      <path d="M-4 -3 L-14 -22 L-8 -22 L8 -3Z M-4 3 L-14 22 L-8 22 L8 3Z M-20 -3 L-26 -12 L-22 -12 L-14 -3Z M-20 3 L-26 12 L-22 12 L-14 3Z" />
    </g>
  </>
);

const SCENES: Record<Area, Art> = { north, center, jerusalem, south, europe, usa, asia, other };

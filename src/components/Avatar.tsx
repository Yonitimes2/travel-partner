import type { AvatarId } from "@/lib/types";

export const AVATARS: Record<AvatarId, { emoji: string; bg: string }> = {
  backpack: { emoji: "🎒", bg: "#fde7d4" },
  mountain: { emoji: "⛰️", bg: "#e2ecf6" },
  tent: { emoji: "⛺", bg: "#e6f2e3" },
  compass: { emoji: "🧭", bg: "#dff1ee" },
  camel: { emoji: "🐪", bg: "#f8ecd2" },
  wave: { emoji: "🌊", bg: "#dcecfa" },
  tree: { emoji: "🌳", bg: "#e3f1df" },
  bike: { emoji: "🚲", bg: "#efe6f7" },
  plane: { emoji: "✈️", bg: "#e5eaf8" },
  jeep: { emoji: "🚙", bg: "#f6e3dc" },
  camera: { emoji: "📷", bg: "#ecebe7" },
  sun: { emoji: "☀️", bg: "#fdf1c9" },
};

export const AVATAR_IDS = Object.keys(AVATARS) as AvatarId[];

export function Avatar({ id, size = 40 }: { id: AvatarId; size?: number }) {
  const a = AVATARS[id];
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, background: a.bg, fontSize: size * 0.5 }}
    >
      {a.emoji}
    </span>
  );
}

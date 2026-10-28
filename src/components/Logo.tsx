import benny from "@/assets/benny.webp";
import { useT } from "./Providers";

/** the app's mark: Benny Waxler's face, from his caricature (176 pixels, enough for every size it's shown at) */
export function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  // a small file already made at the right size: nothing for next/image to do
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={benny.src} width={size} height={size} alt="" decoding="async" className={`shrink-0 rounded-full ${className}`} />;
}

/** the face, the app's name and Benny's, for the top of the screens with a photo behind */
export function Brand({ size = 40 }: { size?: number }) {
  const { t } = useT();
  return (
    <span className="flex items-center gap-2.5">
      <Logo size={size} className="shadow-lg shadow-navy/30 ring-2 ring-white/80" />
      <span className="leading-tight">
        <span className="block text-lg font-bold tracking-tight">{t.appName}</span>
        <span className="block text-xs font-medium opacity-85">{t.host}</span>
      </span>
    </span>
  );
}

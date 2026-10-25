"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Languages, Star } from "lucide-react";
import { useT } from "./Providers";
import { tierOf } from "@/lib/rules";

export const inputClass =
  "w-full rounded-2xl border border-line bg-white px-3.5 py-3 text-ink outline-none transition focus:border-sky focus:ring-4 focus:ring-sky/15";

export const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3.5 text-base font-semibold text-white shadow-lg shadow-navy/20 transition hover:bg-navy-2 disabled:opacity-40";

export const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-ink ring-1 ring-line transition hover:ring-sky/40";

/** a round back button; on dark headers and on the destination art it's frosted glass */
export function BackButton({ to, onDark = true }: { to: string; onDark?: boolean }) {
  const { t, href } = useT();
  return (
    <Link
      href={href(to)}
      aria-label={t.trip.back}
      className={`flex h-10 w-10 items-center justify-center rounded-full ${onDark ? "glass text-white" : "bg-white text-ink ring-1 ring-line"}`}
    >
      <ArrowLeft size={20} className="rtl:rotate-180" aria-hidden />
    </Link>
  );
}

/** the navy header of every inner page */
export function PageHeader({
  title,
  back,
  action,
  children,
}: {
  title: React.ReactNode;
  back?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-2 px-4 pb-7 pt-4 text-white">
      <div aria-hidden className="pointer-events-none absolute -top-16 end-[-4rem] h-48 w-48 rounded-full bg-sky/25 blur-3xl" />
      {(back || action) && (
        <div className="relative mb-3 flex items-center justify-between gap-2">
          {back ? <BackButton to={back} /> : <span />}
          {action}
        </div>
      )}
      <h1 className="relative text-[26px] font-bold leading-tight">{title}</h1>
      {children && <div className="relative mt-2">{children}</div>}
    </header>
  );
}

/** content that slides up over a header, like a sheet */
export function Body({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`relative -mt-4 rounded-t-[28px] bg-mist px-4 pt-5 ${className}`}>{children}</div>;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-3xl bg-white p-4 shadow-[0_6px_20px_-12px_rgba(11,29,77,0.25)] ${className}`}>{children}</section>;
}

/** a bottom sheet over a dimmed page; rendered at the top of the page so no header or bar can cover it */
export function Sheet({ onClose, labelledBy, children }: { onClose: () => void; labelledBy: string; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/45 backdrop-blur-[2px]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal
        aria-labelledby={labelledBy}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-white p-5 pb-8 shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" />
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function Chip({
  selected,
  onClick,
  className = "",
  children,
}: {
  selected: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex items-center rounded-2xl px-3.5 py-2.5 text-sm font-medium ring-1 transition ${
        selected ? "bg-navy text-white ring-navy" : "bg-white text-ink ring-line hover:ring-sky/40"
      } ${className}`}
    >
      {children}
    </button>
  );
}

/** two or three equal tabs in a pill */
export function SegTabs<K extends string>({
  value,
  onChange,
  options,
}: {
  value: K;
  onChange: (key: K) => void;
  options: { key: K; label: React.ReactNode }[];
}) {
  return (
    <div role="tablist" className="flex gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-line">
      {options.map((o) => (
        <button
          key={o.key}
          role="tab"
          type="button"
          aria-selected={value === o.key}
          onClick={() => onChange(o.key)}
          className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            value === o.key ? "bg-navy text-white shadow" : "text-muted hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** gold points badge, like a frequent-flyer tier */
export function PointsPill({ points, onDark = false, compact = false }: { points: number; onDark?: boolean; compact?: boolean }) {
  const { t } = useT();
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
        onDark ? "bg-gold-soft/95 text-gold" : "bg-gold-soft text-gold"
      }`}
    >
      <Star size={13} className="fill-current" aria-hidden />
      {t.points(points)}
      {!compact && <span className="font-medium opacity-80">· {t.tier[tierOf(points)]}</span>}
    </span>
  );
}

export function LangToggle({ onDark = true }: { onDark?: boolean }) {
  const { t, lang } = useT();
  const router = useRouter();

  // read the current path on click, so nothing here waits for the route's params
  const switchLang = () => {
    const other = lang === "he" ? "en" : "he";
    const rest = window.location.pathname.replace(/^\/(he|en)(?=\/|$)/, "");
    router.push(`/${other}${rest}${window.location.search}`);
  };

  return (
    <button
      type="button"
      onClick={switchLang}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
        onDark ? "glass text-white" : "bg-white text-ink ring-1 ring-line"
      }`}
    >
      <Languages size={14} aria-hidden />
      {t.langSwitch}
    </button>
  );
}

export function Field({ label, error, htmlFor, children }: { label: string; error?: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {error && (
        <p data-error className="mt-1 text-sm text-coral">
          {error}
        </p>
      )}
    </div>
  );
}

export function Empty({ text, action, to }: { text: string; action?: string; to?: string }) {
  const { href } = useT();
  return (
    <div className="rounded-3xl border-2 border-dashed border-line px-4 py-10 text-center">
      <p className="text-sm text-muted">{text}</p>
      {action && to && (
        <Link href={href(to)} className={`${primaryButton} mt-4 px-4 py-2.5 text-sm`}>
          {action}
        </Link>
      )}
    </div>
  );
}

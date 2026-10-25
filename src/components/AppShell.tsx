"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useMemo } from "react";
import { Compass, FlaskConical, Languages, Luggage, MessageCircle, Plus, UserRound } from "lucide-react";
import { useT, useToast } from "./Providers";
import { DEMO_MAN, DEMO_WOMAN } from "@/lib/seed";
import { findUser, useApp } from "@/lib/store";
import type { Gender } from "@/lib/types";

export function AppShell({ children }: { children: React.ReactNode }) {
  const users = useApp((s) => s.users);
  const meId = useApp((s) => s.meId);
  const me = findUser(users, meId);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-sand md:my-4 md:min-h-[calc(100dvh-2rem)] md:rounded-3xl md:shadow-xl md:ring-1 md:ring-line">
      <DemoStrip gender={me?.gender} />
      <Header gender={me?.gender} />
      <main className="flex-1 px-4 pb-32 pt-2">{children}</main>
      <Suspense fallback={<BottomNav active={null} />}>
        <LiveBottomNav />
      </Suspense>
    </div>
  );
}

function DemoStrip({ gender }: { gender?: Gender }) {
  const { t, href } = useT();
  const toast = useToast();
  const router = useRouter();
  const viewAs = useApp((s) => s.viewAs);

  const pick = (g: Gender) => {
    if (g === gender) return;
    viewAs(g === "male" ? DEMO_MAN : DEMO_WOMAN);
    toast(t.section[g]);
    router.push(href("/"));
  };

  return (
    <div className="flex items-center justify-between gap-2 border-b border-dashed border-amber-300 bg-amber-50 px-4 py-1.5 text-xs text-amber-900 md:rounded-t-3xl">
      <span className="flex items-center gap-1.5">
        <FlaskConical size={14} aria-hidden />
        {t.demo.banner}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="hidden min-[380px]:inline">{t.demo.viewAs}</span>
        <span className="flex rounded-full bg-white p-0.5 ring-1 ring-amber-200">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => pick(g)}
              aria-pressed={gender === g}
              className={`rounded-full px-2.5 py-0.5 font-medium transition ${
                gender === g ? "bg-amber-500 text-white" : "text-amber-900 hover:bg-amber-100"
              }`}
            >
              {t.gender[g]}
            </button>
          ))}
        </span>
      </span>
    </div>
  );
}

function Header({ gender }: { gender?: Gender }) {
  const { t, lang, href } = useT();
  const router = useRouter();

  // read the current path on click, so the header doesn't need to wait for the route's params
  const switchLang = () => {
    const other = lang === "he" ? "en" : "he";
    const rest = window.location.pathname.replace(/^\/(he|en)(?=\/|$)/, "");
    router.push(`/${other}${rest}${window.location.search}`);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-sand/90 px-4 py-3 backdrop-blur">
      <Link href={href("/")} className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
          <Compass size={20} aria-hidden />
        </span>
        <span className="leading-tight">
          <span className="block text-lg font-bold text-ink">{t.appName}</span>
          {gender && <span className="block text-xs font-medium text-brand">{t.section[gender]}</span>}
        </span>
      </Link>
      <button
        type="button"
        onClick={switchLang}
        className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-ink ring-1 ring-line hover:bg-cream"
      >
        <Languages size={16} aria-hidden />
        {t.langSwitch}
      </button>
    </header>
  );
}

type NavKey = "trips" | "my" | "new" | "chats" | "profile";

function LiveBottomNav() {
  const pathname = usePathname();
  const rest = pathname.replace(/^\/(he|en)(?=\/|$)/, "") || "/";
  const active: NavKey | null =
    rest === "/" || rest.startsWith("/trips")
      ? "trips"
      : rest.startsWith("/my")
        ? "my"
        : rest.startsWith("/new")
          ? "new"
          : rest.startsWith("/chat")
            ? "chats"
            : rest.startsWith("/profile")
              ? "profile"
              : null;
  return <BottomNav active={active} />;
}

function BottomNav({ active }: { active: NavKey | null }) {
  const { t, href } = useT();
  const meId = useApp((s) => s.meId);
  const trips = useApp((s) => s.trips);
  const requests = useApp((s) => s.requests);

  // requests waiting for my answer, shown as a dot on "My trips"
  const waiting = useMemo(() => {
    const mine = new Set(trips.filter((tr) => tr.ownerId === meId).map((tr) => tr.id));
    return requests.filter((r) => r.status === "pending" && mine.has(r.tripId)).length;
  }, [trips, requests, meId]);

  const item = (key: NavKey, path: string, Icon: typeof Compass, badge = 0) => (
    <Link
      href={href(path)}
      aria-current={active === key ? "page" : undefined}
      className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
        active === key ? "text-brand" : "text-muted hover:text-ink"
      }`}
    >
      <Icon size={22} strokeWidth={active === key ? 2.4 : 1.8} aria-hidden />
      {t.nav[key]}
      {badge > 0 && (
        <span className="absolute top-1 start-1/2 ms-2 min-w-4 rounded-full bg-coral px-1 text-center text-[10px] leading-4 text-white">
          {badge}
        </span>
      )}
    </Link>
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-line bg-white/95 pb-safe backdrop-blur md:bottom-4 md:rounded-b-3xl">
      <div className="flex items-end px-2">
        {item("trips", "/", Compass)}
        {item("my", "/my", Luggage, waiting)}
        <Link
          href={href("/new")}
          aria-current={active === "new" ? "page" : undefined}
          className="flex flex-1 flex-col items-center gap-0.5 pb-2 text-[11px] font-medium text-ink"
        >
          <span className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/30 ring-4 ring-white">
            <Plus size={28} aria-hidden />
          </span>
          {t.nav.new}
        </Link>
        {item("chats", "/chat", MessageCircle)}
        {item("profile", "/profile", UserRound)}
      </div>
    </nav>
  );
}

/** pages render inside this: the sample data only exists in the browser, so the server sends placeholders */
export function Gate({ children }: { children: React.ReactNode }) {
  const ready = useApp((s) => s.ready);
  const hasMe = useApp((s) => s.users.some((u) => u.id === s.meId));
  return ready && hasMe ? children : <Loading />;
}

function Loading() {
  return (
    <div className="space-y-3 pt-2" aria-busy>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/70" />
      ))}
    </div>
  );
}

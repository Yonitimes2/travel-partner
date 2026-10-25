"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import { Compass, FlaskConical, Luggage, MessageCircle, Plus, UserRound } from "lucide-react";
import { useT } from "./Providers";
import { DEMO_MAN, DEMO_WOMAN } from "@/lib/seed";
import { useApp } from "@/lib/store";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-clip bg-mist md:my-4 md:min-h-[calc(100dvh-2rem)] md:rounded-[32px] md:shadow-2xl md:ring-1 md:ring-black/5">
      {process.env.NODE_ENV === "development" && <DevStrip />}
      <main className="flex-1 pb-32">{children}</main>
      <Suspense fallback={<BottomNav active={null} />}>
        <LiveBottomNav />
      </Suspense>
    </div>
  );
}

/** pages render inside this: the data comes from the server after the page loads; signed-out people go to /welcome */
export function Gate({ children, allowPending = false }: { children: React.ReactNode; allowPending?: boolean }) {
  const { href } = useT();
  const router = useRouter();
  const ready = useApp((s) => s.ready);
  const signedIn = useApp((s) => s.signedIn);
  const me = useApp((s) => s.users.find((u) => u.id === s.meId));
  useEffect(() => {
    if (ready && !signedIn) router.replace(href("/welcome"));
  }, [ready, signedIn, router, href]);
  if (!ready || !me) return <Loading />;
  if (me.status !== "active" && !allowPending) return <NotActive suspended={me.status === "suspended"} />;
  return children;
}

/** someone who signed up and isn't approved yet (or was suspended) only gets this */
function NotActive({ suspended }: { suspended: boolean }) {
  const { t, href } = useT();
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-extrabold text-ink">{suspended ? t.admin.suspended : t.welcome.pendingTitle}</h1>
      {!suspended && (
        <Link href={href("/welcome")} className="mt-5 rounded-2xl bg-navy px-6 py-3 font-semibold text-white">
          {t.welcome.next}
        </Link>
      )}
    </div>
  );
}

/**
 * Development only (`next dev`): sign in as the sample man or woman (each runs their own section),
 * and refill the database with the sample data.
 */
function DevStrip() {
  const { href } = useT();
  const router = useRouter();
  const meId = useApp((s) => s.meId);
  const refresh = useApp((s) => s.refresh);

  const post = async (url: string, body?: object) => {
    await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) });
    router.push(href("/"));
    await refresh();
  };

  const button = (label: string, on: boolean, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full px-2.5 py-0.5 font-medium transition ${on ? "bg-amber-500 text-white" : "text-amber-900 hover:bg-amber-100"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center justify-between gap-2 border-b border-dashed border-amber-300 bg-amber-50 px-4 py-1.5 text-xs text-amber-900 md:rounded-t-[32px]">
      <span className="flex items-center gap-1.5">
        <FlaskConical size={14} aria-hidden />
        dev
      </span>
      <span className="flex rounded-full bg-white p-0.5 ring-1 ring-amber-200">
        {button("גבר", meId === DEMO_MAN, () => post("/api/dev/login", { userId: DEMO_MAN }))}
        {button("אישה", meId === DEMO_WOMAN, () => post("/api/dev/login", { userId: DEMO_WOMAN }))}
        {button("נתוני דוגמה", false, () => post("/api/dev/seed"))}
        <a href="/api/dev/outbox" target="_blank" className="rounded-full px-2.5 py-0.5 font-medium hover:bg-amber-100">
          מיילים
        </a>
      </span>
    </div>
  );
}

type NavKey = "trips" | "my" | "new" | "chats" | "profile";

function LiveBottomNav() {
  const pathname = usePathname();
  const rest = pathname.replace(/^\/(he|en)(?=\/|$)/, "") || "/";
  // signing up is its own flow, without the app's navigation
  if (rest.startsWith("/welcome")) return null;
  const active: NavKey | null =
    rest === "/" || rest.startsWith("/trips")
      ? "trips"
      : rest.startsWith("/my")
        ? "my"
        : rest.startsWith("/new")
          ? "new"
          : rest.startsWith("/chat")
            ? "chats"
            : rest.startsWith("/profile") || rest.startsWith("/admin") || rest.startsWith("/safety")
              ? "profile"
              : null;
  return <BottomNav active={active} />;
}

function BottomNav({ active }: { active: NavKey | null }) {
  const { t, href } = useT();
  const meId = useApp((s) => s.meId);
  const trips = useApp((s) => s.trips);
  const requests = useApp((s) => s.requests);

  // requests waiting for my answer, shown on "My trips"
  const waiting = useMemo(() => {
    const mine = new Set(trips.filter((tr) => tr.ownerId === meId).map((tr) => tr.id));
    return requests.filter((r) => r.status === "pending" && mine.has(r.tripId)).length;
  }, [trips, requests, meId]);

  const item = (key: NavKey, path: string, Icon: typeof Compass, badge = 0) => {
    const on = active === key;
    return (
      <Link
        href={href(path)}
        aria-current={on ? "page" : undefined}
        className={`relative flex flex-1 flex-col items-center gap-1 pb-2 pt-2.5 text-[11px] font-semibold transition ${
          on ? "text-navy" : "text-muted hover:text-ink"
        }`}
      >
        <span className={`flex h-8 w-12 items-center justify-center rounded-full transition ${on ? "bg-sky-soft" : ""}`}>
          <Icon size={21} strokeWidth={on ? 2.3 : 1.8} aria-hidden />
        </span>
        {t.nav[key]}
        {badge > 0 && (
          <span className="absolute top-1.5 start-1/2 ms-2.5 min-w-4 rounded-full bg-coral px-1 text-center text-[10px] leading-4 text-white ring-2 ring-white">
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md rounded-t-[28px] bg-white/95 pb-safe shadow-[0_-8px_30px_-12px_rgba(11,29,77,0.25)] backdrop-blur md:bottom-4 md:rounded-b-[32px]">
      <div className="flex items-end px-1">
        {item("trips", "/", Compass)}
        {item("my", "/my", Luggage, waiting)}
        <Link
          href={href("/new")}
          aria-current={active === "new" ? "page" : undefined}
          className="flex flex-1 flex-col items-center gap-1 pb-2 text-[11px] font-semibold text-navy"
        >
          <span className="-mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-2 to-navy text-white shadow-xl shadow-navy/30 ring-4 ring-white">
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

function Loading() {
  return (
    <div className="space-y-3 p-4" aria-busy>
      <div className="h-48 animate-pulse rounded-3xl bg-white/70" />
      {[0, 1].map((i) => (
        <div key={i} className="h-40 animate-pulse rounded-3xl bg-white/70" />
      ))}
    </div>
  );
}

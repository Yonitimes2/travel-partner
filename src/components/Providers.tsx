"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { dictionaries, dirOf, type Dict } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import type { Lang } from "@/lib/types";

interface LangValue {
  lang: Lang;
  t: Dict;
  dir: "rtl" | "ltr";
  /** a path inside the app, with the language in front: href("/new") → "/he/new" */
  href: (path: string) => string;
}

/** how often the app asks the server for news (a chat asks more often while it's open) */
const POLL_MS = 10_000;

const LangContext = createContext<LangValue | null>(null);
const ToastContext = createContext<(message: string) => void>(() => {});

export function useT() {
  const value = useContext(LangContext);
  if (!value) throw new Error("useT outside <Providers>");
  return value;
}

export const useToast = () => useContext(ToastContext);

export function Providers({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const value = useMemo<LangValue>(
    () => ({
      lang,
      t: dictionaries[lang],
      dir: dirOf(lang),
      href: (path) => `/${lang}${path === "/" ? "" : path}`,
    }),
    [lang],
  );

  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const showToast = useCallback((message: string) => {
    setToast(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  // the data comes from the server: once now, then every few seconds while the app is in view
  useEffect(() => {
    const { init, refresh } = useApp.getState();
    init();
    const tick = setInterval(() => document.visibilityState === "visible" && refresh(), POLL_MS);
    const onShow = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onShow);
    return () => {
      clearInterval(tick);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, []);

  // a change the server refused: shown as a message (each refusal once, even the same one twice)
  useEffect(
    () =>
      useApp.subscribe((s, prev) => {
        if (s.error && s.error !== prev.error) showToast(value.t.errors[s.error.code as keyof Dict["errors"]] ?? value.t.errors.unknown);
      }),
    [showToast, value.t],
  );

  return (
    <LangContext.Provider value={value}>
      <ToastContext.Provider value={showToast}>
        {children}
        {toast && (
          <div
            role="status"
            className="fixed inset-x-0 bottom-24 z-50 mx-auto w-fit max-w-[90vw] rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white shadow-lg"
          >
            {toast}
          </div>
        )}
      </ToastContext.Provider>
    </LangContext.Provider>
  );
}

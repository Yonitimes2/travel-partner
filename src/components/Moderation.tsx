"use client";

import { useState } from "react";
import { Ban, Flag, MoreHorizontal } from "lucide-react";
import { Sheet, inputClass, primaryButton } from "./ui";
import { useT, useToast } from "./Providers";
import { useApp } from "@/lib/store";
import type { ReportReason, User } from "@/lib/types";

const REASONS: ReportReason[] = ["behavior", "fake", "spam", "other"];

/** the ⋯ button next to another person: report them to the section's admins, or block them */
export function UserActions({ user, onBlocked, onDark = true }: { user: User; onBlocked: () => void; onDark?: boolean }) {
  const { t } = useT();
  const toast = useToast();
  const { report, block } = useApp();
  const [view, setView] = useState<"closed" | "menu" | "report" | "block">("closed");
  const [reason, setReason] = useState<ReportReason>("behavior");
  const [text, setText] = useState("");

  const close = () => {
    setView("closed");
    setText("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setView("menu")}
        aria-label={t.moderation.menu}
        className={`flex h-10 w-10 items-center justify-center rounded-full ${onDark ? "glass text-white" : "bg-white text-ink ring-1 ring-line"}`}
      >
        <MoreHorizontal size={20} aria-hidden />
      </button>

      {view !== "closed" && (
        <Sheet onClose={close} labelledBy="moderation-title">
          {view === "menu" && (
            <div className="space-y-2">
              <h2 id="moderation-title" className="mb-3 text-lg font-bold text-ink">
                {user.nickname}
              </h2>
              <button type="button" onClick={() => setView("report")} className="flex w-full items-center gap-3 rounded-2xl bg-mist px-4 py-3.5 text-start font-semibold text-ink">
                <Flag size={18} className="text-coral" aria-hidden />
                {t.moderation.report}
              </button>
              <button type="button" onClick={() => setView("block")} className="flex w-full items-center gap-3 rounded-2xl bg-mist px-4 py-3.5 text-start font-semibold text-ink">
                <Ban size={18} className="text-coral" aria-hidden />
                {t.moderation.block}
              </button>
            </div>
          )}

          {view === "report" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                report(user.id, reason, text);
                toast(t.moderation.reported);
                close();
              }}
            >
              <h2 id="moderation-title" className="text-lg font-bold text-ink">
                {t.moderation.reportTitle(user.nickname)}
              </h2>
              <div className="mt-4 space-y-2">
                {REASONS.map((r) => (
                  <label key={r} className={`flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 ring-1 ${reason === r ? "bg-sky-soft ring-sky" : "bg-white ring-line"}`}>
                    <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="accent-sky" />
                    <span className="text-sm font-medium text-ink">{t.moderation.reason[r]}</span>
                  </label>
                ))}
              </div>
              <label htmlFor="report-text" className="mb-1.5 mt-4 block text-sm font-semibold text-ink">
                {t.moderation.details}
              </label>
              <textarea id="report-text" rows={3} maxLength={300} value={text} onChange={(e) => setText(e.target.value)} className={`${inputClass} resize-none`} />
              <button type="submit" className={`${primaryButton} mt-4 w-full bg-coral shadow-coral/20 hover:bg-coral/90`}>
                {t.moderation.sendReport}
              </button>
            </form>
          )}

          {view === "block" && (
            <div>
              <h2 id="moderation-title" className="text-lg font-bold text-ink">
                {t.moderation.block}
              </h2>
              <p className="mt-2 text-ink">{t.moderation.blockConfirm(user.nickname)}</p>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    block(user.id);
                    toast(t.moderation.blocked);
                    close();
                    onBlocked();
                  }}
                  className={`${primaryButton} flex-1 bg-coral shadow-coral/20 hover:bg-coral/90`}
                >
                  {t.moderation.block}
                </button>
                <button type="button" onClick={close} className="rounded-2xl px-5 font-semibold text-muted">
                  {t.moderation.cancel}
                </button>
              </div>
            </div>
          )}
        </Sheet>
      )}
    </>
  );
}

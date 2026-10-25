"use client";

import { useState } from "react";
import { AlertTriangle, Check, CheckCircle2, Flag, Lock, Phone, X } from "lucide-react";
import { Avatar } from "./Avatar";
import { ProfileFacts } from "./TripView";
import { Body, Card, Empty, PageHeader, SegTabs } from "./ui";
import { useT, useToast } from "./Providers";
import { formatPhone } from "@/lib/rules";
import { findUser, useApp } from "@/lib/store";
import type { Gender, User } from "@/lib/types";

/** each section has its own admins: men approve men, women approve women */
export function Admin() {
  const { t } = useT();
  const toast = useToast();
  const { users, reports, meId, approveUser, setUserStatus, handleReport } = useApp();
  const me = findUser(users, meId)!;
  const [section, setSection] = useState<Gender>(me.gender);
  const [tab, setTab] = useState<"pending" | "reports" | "users">("pending");

  const inSection = users.filter((u) => u.gender === section);
  const pending = inSection.filter((u) => u.status === "pending");
  const openReports = reports.filter((r) => r.status === "open" && findUser(users, r.aboutUserId)?.gender === section);
  const members = inSection.filter((u) => u.status !== "pending");

  return (
    <div>
      <PageHeader title={t.admin.title} back="/profile">
        <div className="mt-1 inline-flex rounded-full bg-white/10 p-1">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              aria-pressed={section === g}
              onClick={() => setSection(g)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${section === g ? "bg-white text-navy" : "text-white/80"}`}
            >
              {t.section[g]}
            </button>
          ))}
        </div>
      </PageHeader>
      <Body>
        <SegTabs
          value={tab}
          onChange={setTab}
          options={[
            { key: "pending", label: `${t.admin.pending} (${pending.length})` },
            { key: "reports", label: `${t.admin.reports} (${openReports.length})` },
            { key: "users", label: t.admin.users },
          ]}
        />

        <div className="mt-4 space-y-3">
          {tab === "pending" &&
            (pending.length === 0 ? (
              <Empty text={t.admin.noPending} />
            ) : (
              pending.map((u) => {
                const by = u.referredBy ? findUser(users, u.referredBy) : undefined;
                return (
                  <Card key={u.id}>
                    <Person user={u} />
                    <div className="mt-3">
                      <ProfileFacts user={u} />
                    </div>
                    {u.about && <p className="mt-2 text-sm text-ink">{u.about}</p>}
                    <PrivateDetails user={u} />
                    {by && <Referral user={u} by={by} />}
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          approveUser(u.id);
                          toast(t.admin.approved);
                        }}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-navy py-2.5 text-sm font-bold text-white"
                      >
                        <Check size={16} aria-hidden />
                        {t.admin.approve}
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserStatus(u.id, "suspended")}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-sm font-semibold text-muted ring-1 ring-line"
                      >
                        <X size={16} aria-hidden />
                        {t.admin.reject}
                      </button>
                    </div>
                  </Card>
                );
              })
            ))}

          {tab === "reports" &&
            (openReports.length === 0 ? (
              <Empty text={t.admin.noReports} />
            ) : (
              openReports.map((r) => {
                const from = findUser(users, r.fromUserId);
                const about = findUser(users, r.aboutUserId)!;
                return (
                  <Card key={r.id}>
                    <p className="flex items-center gap-2 font-bold text-ink">
                      <Flag size={16} className="text-coral" aria-hidden />
                      {t.admin.reportOf(from?.nickname ?? "", about.nickname)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-coral">{t.moderation.reason[r.reason]}</p>
                    {r.text && <p className="mt-2 border-s-[3px] border-line ps-2.5 text-sm text-ink">{r.text}</p>}
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setUserStatus(about.id, "suspended");
                          handleReport(r.id);
                        }}
                        className="flex-1 rounded-xl bg-coral py-2.5 text-sm font-bold text-white"
                      >
                        {t.admin.suspend}
                      </button>
                      <button type="button" onClick={() => handleReport(r.id)} className="flex-1 rounded-xl bg-white py-2.5 text-sm font-semibold text-muted ring-1 ring-line">
                        {t.admin.dismiss}
                      </button>
                    </div>
                  </Card>
                );
              })
            ))}

          {tab === "users" && (
            <ul className="overflow-hidden rounded-3xl bg-white shadow-[0_6px_20px_-12px_rgba(11,29,77,0.25)]">
              {members.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-2 border-b border-line px-4 py-3 last:border-b-0">
                  <Person user={u} />
                  {u.status === "suspended" ? (
                    <button type="button" onClick={() => setUserStatus(u.id, "active")} className="shrink-0 rounded-full bg-mist px-3 py-1.5 text-xs font-bold text-navy">
                      {t.admin.restore}
                    </button>
                  ) : (
                    u.id !== meId && (
                      <button type="button" onClick={() => setUserStatus(u.id, "suspended")} className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold text-coral hover:bg-coral/10">
                        {t.admin.suspend}
                      </button>
                    )
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Body>
    </div>
  );
}

/** what only the admins see: the full name and phone given at sign-up */
function PrivateDetails({ user }: { user: User }) {
  const { t } = useT();
  return (
    <div className="mt-3 rounded-2xl bg-mist px-3.5 py-2.5 text-sm">
      <p className="flex items-center gap-1.5 text-xs font-bold text-muted">
        <Lock size={12} aria-hidden />
        {t.admin.privateDetails}
      </p>
      <p className="mt-1 flex items-center justify-between gap-2">
        <span className="font-semibold text-ink">{user.fullName}</span>
        <a href={`tel:${user.phone}`} dir="ltr" className="font-semibold text-sky">
          {formatPhone(user.phone)}
        </a>
      </p>
    </div>
  );
}

const sameName = (a: string, b: string) => a.trim().replace(/\s+/g, " ") === b.trim().replace(/\s+/g, " ");

/** the recommendation: who it is, the name that was typed against the name on file, and a call button */
function Referral({ user, by }: { user: User; by: User }) {
  const { t } = useT();
  const typed = user.referral?.name ?? "";
  const matches = sameName(typed, by.fullName);
  return (
    <div className="mt-2.5 rounded-2xl bg-sky-soft/60 px-3.5 py-3 text-sm">
      <p className="text-xs font-bold text-muted">{t.admin.referral}</p>
      <p className="mt-1.5 flex items-center gap-2 font-semibold text-navy">
        <Avatar id={by.avatar} size={22} />
        {t.admin.recommendedBy(by.nickname)}
      </p>
      <p className="mt-1.5 text-ink">{t.admin.typedName(typed)}</p>
      <p className={`mt-1 flex items-center gap-1.5 text-xs font-semibold ${matches ? "text-mint" : "text-amber-700"}`}>
        {matches ? <CheckCircle2 size={14} aria-hidden /> : <AlertTriangle size={14} aria-hidden />}
        {matches ? t.admin.nameMatches : t.admin.nameDiffers(by.fullName)}
      </p>
      <a
        href={`tel:${by.phone}`}
        className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-navy ring-1 ring-line"
      >
        <Phone size={13} aria-hidden />
        {t.admin.call}
        <span dir="ltr" className="font-semibold text-muted">
          {formatPhone(by.phone)}
        </span>
      </a>
    </div>
  );
}

function Person({ user }: { user: User }) {
  const { t } = useT();
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <Avatar id={user.avatar} size={40} />
      <span className="min-w-0">
        <span className="block truncate font-bold text-ink">
          {user.nickname}
          {user.status === "suspended" && <span className="ms-2 rounded-full bg-coral/10 px-2 py-0.5 text-[11px] font-bold text-coral">{t.admin.suspended}</span>}
        </span>
        <span className="block truncate text-xs text-muted">{user.city}</span>
      </span>
    </span>
  );
}

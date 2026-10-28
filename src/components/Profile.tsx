"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, Compass, LogOut, Lock, Mail, ShieldCheck, Star, Users } from "lucide-react";
import { AVATAR_IDS, Avatar } from "./Avatar";
import { Logo } from "./Logo";
import { PartyPicker } from "./PartyPicker";
import { Body, Card, Chip, Field, LangToggle, inputClass, primaryButton } from "./ui";
import { useT, useToast } from "./Providers";
import { formatPhone, phoneDigits, tierOf } from "@/lib/rules";
import { findUser, useApp } from "@/lib/store";
import type { AgeGroup, AvatarId, Observance, Pace, Party, User } from "@/lib/types";

export const AGE_GROUPS: AgeGroup[] = ["18-25", "26-35", "36-50", "50+"];
export const OBSERVANCE: Observance[] = ["strict", "kosher", "traditional"];
export const PACES: Pace[] = ["easy", "medium", "hard"];

export function Profile() {
  const meId = useApp((s) => s.meId);
  // a fresh form when the "view as" switch changes who you are
  return <ProfileForm key={meId} />;
}

/** the membership card: points and tier, like a frequent-flyer card */
function MemberCard({ me }: { me: User }) {
  const { t } = useT();
  const stats = me.stats;
  const tier = tierOf(stats.points);
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-navy-2 to-[#1d3f91] p-5 text-white shadow-2xl shadow-navy/30">
      <div aria-hidden className="absolute -end-10 -top-10 h-40 w-40 rounded-full border-[18px] border-[#e9c46a]/45" />
      <div aria-hidden className="absolute -bottom-16 start-10 h-40 w-40 rounded-full bg-sky/20 blur-2xl" />
      <div className="relative flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <Logo size={24} className="ring-1 ring-white/50" />
          <span className="opacity-90">{t.appName}</span>
        </span>
        <span className="rounded-full bg-gold-soft px-3 py-1 text-xs font-extrabold text-gold">{t.tier[tier]}</span>
      </div>
      <div className="relative mt-5 flex items-center gap-3">
        <span className="rounded-full ring-2 ring-white/40">
          <Avatar id={me.avatar} size={52} />
        </span>
        <div>
          <div className="text-2xl font-extrabold leading-tight">{me.nickname}</div>
          <div className="text-xs opacity-75">{t.section[me.gender]}</div>
        </div>
      </div>
      <div className="relative mt-5 grid grid-cols-3 gap-2 border-t border-white/15 pt-4">
        <Stat icon={<Star size={14} className="fill-current text-gold-soft" aria-hidden />} value={stats.points} label={t.pointsTitle} />
        <Stat icon={<Compass size={14} aria-hidden />} value={stats.trips} label={t.statLabel.trips} />
        <Stat icon={<Users size={14} aria-hidden />} value={stats.joined} label={t.statLabel.joined} />
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div>
      <div className="digits flex items-center gap-1 text-2xl font-extrabold">
        {icon}
        {value}
      </div>
      <div className="text-[11px] opacity-75">{label}</div>
    </div>
  );
}

function ProfileForm() {
  const { t, href } = useT();
  const toast = useToast();
  const router = useRouter();
  const { users, meId, updateProfile, signOut } = useApp();
  const me = findUser(users, meId)!;

  const [nickname, setNickname] = useState(me.nickname);
  const [avatar, setAvatar] = useState<AvatarId>(me.avatar);
  const [party, setParty] = useState<Party>(me.party);
  const [fullName, setFullName] = useState(me.fullName);
  const [phone, setPhone] = useState(formatPhone(me.phone));
  const phoneOk = /^05\d{8}$/.test(phoneDigits(phone));
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(me.ageGroup);
  const [observance, setObservance] = useState<Observance>(me.observance);
  const [pace, setPace] = useState<Pace>(me.pace);
  const [city, setCity] = useState(me.city);
  const [about, setAbout] = useState(me.about);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || fullName.trim().split(/\s+/).length < 2 || !phoneOk) return;
    updateProfile({
      nickname: nickname.trim(), avatar, party, fullName: fullName.trim(), phone: phoneDigits(phone),
      ageGroup, observance, pace, city: city.trim(), about: about.trim(),
    });
    toast(t.profile.saved);
  };

  return (
    <div>
      <header className="bg-gradient-to-b from-navy to-mist px-4 pb-2 pt-4">
        <div className="mb-4 flex items-center justify-between text-white">
          <h1 className="text-[26px] font-bold">{t.profile.title}</h1>
          <LangToggle />
        </div>
        <MemberCard me={me} />
        <p className="mt-3 px-1 text-xs leading-relaxed text-muted">{t.pointsExplain}</p>
      </header>

      <Body className="mt-0 space-y-4 rounded-none">
        <Card>
          <form onSubmit={save} className="space-y-5">
            <Field label={t.profile.nickname} htmlFor="nickname">
              <input id="nickname" value={nickname} maxLength={24} required onChange={(e) => setNickname(e.target.value)} className={inputClass} />
            </Field>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-ink">{t.profile.avatar}</legend>
              <AvatarPicker value={avatar} onChange={setAvatar} />
            </fieldset>

            <div>
              <span className="mb-1.5 block text-sm font-semibold text-ink">{t.profile.gender}</span>
              <div className="flex items-center justify-between rounded-2xl bg-mist px-3.5 py-3">
                <span className="font-semibold text-ink">{t.section[me.gender]}</span>
                <span className="flex items-center gap-1.5 text-xs text-muted">
                  <Lock size={13} aria-hidden />
                  {t.profile.genderLocked}
                </span>
              </div>
            </div>

            <ChoiceRow label={t.profile.ageGroup} options={AGE_GROUPS} value={ageGroup} onChange={setAgeGroup} text={(a) => t.ageGroup[a]} />
            <ChoiceRow label={t.profile.observance} options={OBSERVANCE} value={observance} onChange={setObservance} text={(o) => t.observance[o]} />
            <ChoiceRow label={t.profile.pace} options={PACES} value={pace} onChange={setPace} text={(p) => t.pace[p]} />
            <PartyPicker label={t.profile.party} value={party} onChange={setParty} />

            <Field label={t.profile.city} htmlFor="city">
              <input id="city" value={city} maxLength={40} onChange={(e) => setCity(e.target.value)} className={inputClass} />
            </Field>
            <Field label={t.profile.about} htmlFor="about">
              <textarea id="about" rows={3} maxLength={200} value={about} onChange={(e) => setAbout(e.target.value)} className={`${inputClass} resize-none`} />
            </Field>

            {/* private: only the section's admins see these */}
            <div className="rounded-2xl bg-mist p-3.5">
              <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
                <Lock size={14} aria-hidden />
                {t.profile.privateTitle}
              </p>
              <p className="mt-0.5 text-xs text-muted">{t.profile.privateNote}</p>
              <div className="mt-3 space-y-3">
                <Field label={t.profile.fullName} htmlFor="fullName" error={fullName.trim().split(/\s+/).length < 2 ? t.welcome.errors.fullName : undefined}>
                  <input id="fullName" value={fullName} maxLength={60} autoComplete="name" onChange={(e) => setFullName(e.target.value)} className={inputClass} />
                </Field>
                <Field label={t.profile.phone} htmlFor="phone" error={phoneOk ? undefined : t.welcome.errors.phone}>
                  <input id="phone" type="tel" inputMode="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} className={`${inputClass} text-start`} />
                  <p className="mt-1 text-xs text-muted">{t.profile.phoneUse}</p>
                </Field>
                <div>
                  <span className="mb-1.5 block text-sm font-semibold text-ink">{t.profile.emailAddress}</span>
                  <div className="flex items-center gap-2 rounded-2xl bg-white px-3.5 py-3 text-ink ring-1 ring-line">
                    <Mail size={15} className="shrink-0 text-muted" aria-hidden />
                    <span dir="ltr" className="truncate">
                      {me.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className={`${primaryButton} w-full`}>
              {t.profile.save}
            </button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-1 text-sm font-bold text-muted">{t.profile.notifications}</h2>
          <Toggle label={t.profile.push} checked={me.notify.push} onChange={(push) => updateProfile({ notify: { ...me.notify, push } })} />
          <Toggle label={t.profile.email} checked={me.notify.email} onChange={(email) => updateProfile({ notify: { ...me.notify, email } })} />
        </Card>

        <Link href={href("/safety")} className="flex items-center justify-between rounded-3xl bg-white p-4 font-semibold text-ink shadow-[0_6px_20px_-12px_rgba(11,29,77,0.25)]">
          <span className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-mint" aria-hidden />
            {t.profile.safety}
          </span>
          <ChevronLeft size={18} className="text-muted ltr:rotate-180" aria-hidden />
        </Link>

        {/* only the people who run a section */}
        {me.adminOf.length > 0 && (
          <Link href={href("/admin")} className="flex items-center justify-between rounded-3xl bg-white p-4 font-semibold text-ink shadow-[0_6px_20px_-12px_rgba(11,29,77,0.25)]">
            <span className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-sky" aria-hidden />
              {t.demo.admin}
            </span>
            <ChevronLeft size={18} className="text-muted ltr:rotate-180" aria-hidden />
          </Link>
        )}

        <button
          type="button"
          onClick={async () => {
            await signOut();
            router.replace(href("/welcome"));
          }}
          className="flex w-full items-center justify-center gap-2 rounded-3xl bg-white p-4 font-semibold text-coral shadow-[0_6px_20px_-12px_rgba(11,29,77,0.25)]"
        >
          <LogOut size={18} className="rtl:rotate-180" aria-hidden />
          {t.profile.signOut}
        </button>
      </Body>
    </div>
  );
}

export function AvatarPicker({ value, onChange }: { value: AvatarId; onChange: (id: AvatarId) => void }) {
  const { t } = useT();
  return (
    <div className="grid grid-cols-6 gap-2">
      {AVATAR_IDS.map((id, i) => (
        <button
          key={id}
          type="button"
          aria-pressed={value === id}
          aria-label={`${t.profile.avatar} ${i + 1}`}
          onClick={() => onChange(id)}
          className={`flex items-center justify-center rounded-full p-0.5 transition ${
            value === id ? "ring-[3px] ring-sky ring-offset-2" : "opacity-75 hover:opacity-100"
          }`}
        >
          <Avatar id={id} size={42} />
        </button>
      ))}
    </div>
  );
}

export function ChoiceRow<V extends string>({
  label,
  options,
  value,
  onChange,
  text,
}: {
  label: string;
  options: readonly V[];
  value: V | "";
  onChange: (v: V) => void;
  text: (v: V) => string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-ink">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={o} selected={value === o} onClick={() => onChange(o)}>
            {text(o)}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (on: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-2.5">
      <span className="font-medium text-ink">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="relative h-7 w-12 rounded-full bg-line transition peer-checked:bg-mint peer-focus-visible:ring-4 peer-focus-visible:ring-sky/20 after:absolute after:top-1 after:start-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5" />
    </label>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Compass, Hourglass, ShieldCheck } from "lucide-react";
import { AGE_GROUPS, AvatarPicker, ChoiceRow, OBSERVANCE, PACES } from "./Profile";
import { Photo } from "./Photo";
import { Field, LangToggle, inputClass, primaryButton } from "./ui";
import { useT, useToast } from "./Providers";
import { findUser, useApp } from "@/lib/store";
import type { AgeGroup, AvatarId, Gender, Observance, Pace, TravelsAs } from "@/lib/types";

const STEPS = 5;

/** signing up: phone, SMS code, profile, travel style, a recommendation, then the section's admins approve */
export function Welcome() {
  const { t, href } = useT();
  const toast = useToast();
  const router = useRouter();
  const { users, meId, signUp, viewAs, approveUser } = useApp();
  const me = findUser(users, meId);

  const [step, setStep] = useState(me?.status === "pending" ? 6 : 0);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [avatar, setAvatar] = useState<AvatarId>("compass");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("26-35");
  const [city, setCity] = useState("");
  const [observance, setObservance] = useState<Observance>("kosher");
  const [pace, setPace] = useState<Pace>("medium");
  const [travelsAs, setTravelsAs] = useState<TravelsAs>("solo");
  const [referrer, setReferrer] = useState("");
  const [error, setError] = useState("");

  const sectionMembers = users.filter((u) => u.status === "active" && u.gender === gender);
  const recommender = me?.referredBy ? findUser(users, me.referredBy) : undefined;

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (step === 1 && !/^0?5\d{8}$/.test(phone.replace(/\D/g, ""))) return setError(t.welcome.errors.phone);
    if (step === 2 && !/^\d{4}$/.test(code)) return setError(t.welcome.errors.code);
    if (step === 3 && !nickname.trim()) return setError(t.welcome.errors.nickname);
    if (step === 3 && !gender) return setError(t.welcome.errors.gender);
    if (step === 5) {
      const by = sectionMembers.find((u) => u.nickname === referrer.trim());
      if (!by) return setError(t.welcome.referralNotFound);
      const id = signUp({ nickname: nickname.trim(), avatar, gender: gender as Gender, travelsAs, ageGroup, observance, pace, city: city.trim(), about: "", referredBy: by.id });
      viewAs(id);
    }
    setStep((s) => s + 1);
  };

  if (step === 0) {
    return (
      <div className="relative min-h-[calc(100dvh-2rem)] overflow-hidden text-white">
        <Photo area="jerusalem" photo="jerusalem-citadel-view" sizes="(max-width: 448px) 100vw, 448px" preload />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/50 via-navy/25 to-navy" />
        <div className="relative flex min-h-[calc(100dvh-2rem)] flex-col px-6 pb-10 pt-5">
          <div className="flex items-center justify-between">
            <span className="glass flex h-11 w-11 items-center justify-center rounded-2xl">
              <Compass size={24} aria-hidden />
            </span>
            <LangToggle />
          </div>
          <div className="mt-auto">
            <h1 className="text-[40px] font-extrabold leading-[1.05] tracking-tight">{t.welcome.title}</h1>
            <p className="mt-3 text-lg opacity-90">{t.welcome.subtitle}</p>
            <p className="glass mt-5 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm">
              <ShieldCheck size={18} className="shrink-0" aria-hidden />
              {t.welcome.inviteOnly}
            </p>
            <button type="button" onClick={() => setStep(1)} className="mt-6 w-full rounded-2xl bg-white py-4 text-lg font-bold text-navy shadow-xl">
              {t.welcome.start}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 6 && me) {
    return (
      <div className="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center px-6 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-soft text-sky">
          <Hourglass size={36} aria-hidden />
        </span>
        <h1 className="mt-5 text-3xl font-extrabold text-ink">{t.welcome.pendingTitle}</h1>
        <p className="mt-3 leading-relaxed text-muted">{t.welcome.pendingText(recommender?.nickname ?? "")}</p>
        <button
          type="button"
          onClick={() => {
            approveUser(me.id);
            toast(t.admin.approved);
            router.push(href("/"));
          }}
          className="mt-8 w-full rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900"
        >
          {t.welcome.demoApprove}
        </button>
      </div>
    );
  }

  const titles = [t.welcome.phoneTitle, t.welcome.codeTitle, t.welcome.aboutTitle, t.welcome.styleTitle, t.welcome.referralTitle];

  return (
    <form onSubmit={next} noValidate className="flex min-h-[calc(100dvh-2rem)] flex-col">
      <div className="bg-gradient-to-br from-navy to-navy-2 px-5 pb-8 pt-5 text-white">
        <div className="flex items-center justify-between text-sm">
          <button type="button" onClick={() => setStep((s) => s - 1)} className="font-semibold opacity-85 hover:opacity-100">
            {t.welcome.back}
          </button>
          <span className="opacity-75">{t.welcome.step(step, STEPS)}</span>
        </div>
        <div className="mt-3 flex gap-1.5">
          {Array.from({ length: STEPS }, (_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-white" : "bg-white/25"}`} />
          ))}
        </div>
        <h1 className="mt-5 text-[28px] font-extrabold">{titles[step - 1]}</h1>
      </div>

      <div className="relative -mt-4 flex-1 space-y-5 rounded-t-[28px] bg-mist px-5 pt-6">
        {step === 1 && (
          <Field label={t.welcome.phone} htmlFor="phone">
            <input id="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="050-0000000" className={`${inputClass} text-lg tracking-wider`} />
            <p className="mt-2 text-sm text-muted">{t.welcome.phoneHint}</p>
          </Field>
        )}

        {step === 2 && (
          <div>
            <p className="mb-3 text-sm text-muted">{t.welcome.codeHint(phone)}</p>
            <input
              aria-label={t.welcome.codeTitle}
              inputMode="numeric"
              autoComplete="one-time-code"
              dir="ltr"
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
              className={`${inputClass} digits text-center text-3xl font-bold tracking-[0.6em]`}
            />
            <p className="mt-2 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">{t.welcome.demoCode}</p>
          </div>
        )}

        {step === 3 && (
          <>
            <Field label={t.profile.nickname} htmlFor="nick">
              <input id="nick" value={nickname} maxLength={24} onChange={(e) => setNickname(e.target.value)} className={inputClass} />
            </Field>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-ink">{t.profile.gender}</legend>
              <div className="grid grid-cols-2 gap-2">
                {(["male", "female"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={gender === g}
                    onClick={() => setGender(g)}
                    className={`rounded-2xl px-3 py-3.5 font-bold ring-1 transition ${gender === g ? "bg-navy text-white ring-navy" : "bg-white text-ink ring-line"}`}
                  >
                    {t.section[g]}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-muted">{t.welcome.genderWarn}</p>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-ink">{t.profile.avatar}</legend>
              <AvatarPicker value={avatar} onChange={setAvatar} />
            </fieldset>
            <ChoiceRow label={t.profile.ageGroup} options={AGE_GROUPS} value={ageGroup} onChange={setAgeGroup} text={(a) => t.ageGroup[a]} />
            <Field label={t.profile.city} htmlFor="city">
              <input id="city" value={city} maxLength={40} onChange={(e) => setCity(e.target.value)} className={inputClass} />
            </Field>
          </>
        )}

        {step === 4 && (
          <>
            <ChoiceRow label={t.profile.observance} options={OBSERVANCE} value={observance} onChange={setObservance} text={(o) => t.observance[o]} />
            <ChoiceRow label={t.profile.pace} options={PACES} value={pace} onChange={setPace} text={(p) => t.pace[p]} />
            <ChoiceRow label={t.profile.travelsAs} options={["solo", "family"] as const} value={travelsAs} onChange={setTravelsAs} text={(v) => t.travelsAs[v]} />
          </>
        )}

        {step === 5 && (
          <>
            <p className="text-sm leading-relaxed text-muted">{t.welcome.referralHint}</p>
            <Field label={t.welcome.referralLabel} htmlFor="referrer">
              <input id="referrer" value={referrer} onChange={(e) => setReferrer(e.target.value)} className={inputClass} />
            </Field>
            <p className="rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              {t.welcome.referralExamples(sectionMembers.slice(0, 4).map((u) => u.nickname).join(", "))}
            </p>
          </>
        )}

        {error && (
          <p role="alert" className="text-sm font-medium text-coral">
            {error}
          </p>
        )}

        <button type="submit" className={`${primaryButton} w-full py-4`}>
          {step === 1 ? t.welcome.sendCode : step === 2 ? t.welcome.verify : step === 5 ? t.welcome.submit : t.welcome.next}
        </button>
      </div>
    </form>
  );
}

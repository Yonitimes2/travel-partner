"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Hourglass, Mail, ShieldCheck } from "lucide-react";
import { LogoMark } from "./Logo";
import { PartyPicker } from "./PartyPicker";
import { AGE_GROUPS, AvatarPicker, ChoiceRow, OBSERVANCE, PACES } from "./Profile";
import { Photo } from "./Photo";
import { Field, LangToggle, inputClass, primaryButton } from "./ui";
import { useT } from "./Providers";
import { FULL_WIDTH } from "@/lib/photos";
import { phoneDigits } from "@/lib/rules";
import { findUser, useApp } from "@/lib/store";
import type { AgeGroup, AvatarId, Gender, Observance, Pace, Party } from "@/lib/types";

const isFullName = (name: string) => name.trim().split(/\s+/).length >= 2;
const isPhone = (phone: string) => /^05\d{8}$/.test(phoneDigits(phone));
const isEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

const STEPS = 5;

/** POST to the sign-in API; the answer's JSON, or { error } with the server's code */
async function post(url: string, body: object): Promise<{ error?: string; status?: string }> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return await res.json().catch(() => ({ error: res.ok ? undefined : "unknown" }));
  } catch {
    return { error: "network" };
  }
}

/**
 * Signing in or up with an email code. A member is in after the code; someone new fills in their
 * profile and a recommendation, then waits for the section's admins.
 */
export function Welcome() {
  const { t, lang, href } = useT();
  const router = useRouter();
  const { ready, signedIn, users, meId, refresh } = useApp();
  const me = signedIn ? findUser(users, meId) : undefined;

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [avatar, setAvatar] = useState<AvatarId>("compass");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("26-35");
  const [city, setCity] = useState("");
  const [observance, setObservance] = useState<Observance>("kosher");
  const [pace, setPace] = useState<Pace>("medium");
  const [party, setParty] = useState<Party>({ type: "solo" });
  const [referrerName, setReferrerName] = useState("");
  const [referrerPhone, setReferrerPhone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);

  // a member who is already in has nothing to do here
  useEffect(() => {
    if (me?.status === "active") router.replace(href("/"));
  }, [me?.status, router, href]);

  const errorText = (code: string) => t.errors[code as keyof typeof t.errors] ?? t.errors.unknown;

  const sendCode = async () => {
    const answer = await post("/api/auth/code", { email: email.trim(), lang });
    if (answer.error) return setError(errorText(answer.error));
    setStep(2);
  };

  const next = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      if (step === 1) {
        if (!isEmail(email)) return setError(t.errors.bad_email);
        await sendCode();
      } else if (step === 2) {
        if (!/^\d{6}$/.test(code)) return setError(t.welcome.errors.code);
        const answer = await post("/api/auth/verify", { email: email.trim(), code });
        if (answer.error) return setError(errorText(answer.error));
        if (answer.status === "in") {
          await refresh();
          router.replace(href("/"));
        } else setStep(3);
      } else if (step === 3) {
        if (!nickname.trim()) return setError(t.welcome.errors.nickname);
        if (!isFullName(fullName)) return setError(t.welcome.errors.fullName);
        if (!isPhone(phone)) return setError(t.welcome.errors.phone);
        if (!gender) return setError(t.welcome.errors.gender);
        setStep(4);
      } else if (step === 4) {
        setStep(5);
      } else if (step === 5) {
        const referral = referrerName.trim() || referrerPhone.trim() ? { name: referrerName.trim(), phone: referrerPhone.trim() } : undefined;
        if (referral && !isFullName(referral.name)) return setError(t.welcome.errors.fullName);
        if (referral && !isPhone(referral.phone)) return setError(t.welcome.errors.phone);
        const answer = await post("/api/auth/signup", {
          nickname: nickname.trim(),
          fullName: fullName.trim(),
          phone: phoneDigits(phone),
          avatar,
          gender,
          party,
          ageGroup,
          observance,
          pace,
          city: city.trim(),
          about: "",
          referral,
          lang,
        });
        if (answer.error) return setError(errorText(answer.error));
        // the founders come straight in; everyone else waits for the section's admins
        await refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  // the first screen shows at once; someone already signed in moves on as soon as the server answers
  if (ready && me?.status === "pending") {
    return (
      <div className="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center px-6 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-soft text-sky">
          <Hourglass size={36} aria-hidden />
        </span>
        <h1 className="mt-5 text-3xl font-extrabold text-ink">{t.welcome.pendingTitle}</h1>
        <p className="mt-3 leading-relaxed text-muted">
          {me.referral?.name ? t.welcome.pendingText(me.referral.name) : t.welcome.pendingNoReferral}
        </p>
      </div>
    );
  }

  if (step === 0) {
    return (
      <div className="relative min-h-[calc(100dvh-2rem)] overflow-hidden text-white">
        <Photo area="jerusalem" photo="jerusalem-citadel-view" sizes={FULL_WIDTH} preload />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/50 via-navy/25 to-navy" />
        <div className="relative flex min-h-[calc(100dvh-2rem)] flex-col px-6 pb-10 pt-5">
          <div className="flex items-center justify-between">
            <LogoMark size={44} tile className="shadow-lg shadow-navy/30" />
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

  const titles = [t.welcome.emailTitle, t.welcome.codeTitle, t.welcome.aboutTitle, t.welcome.styleTitle, t.welcome.referralTitle];

  return (
    <form onSubmit={next} noValidate className="flex min-h-[calc(100dvh-2rem)] flex-col">
      <div className="bg-gradient-to-br from-navy to-navy-2 px-5 pb-8 pt-5 text-white">
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => {
              setError("");
              // after the code there is no going back to it: the profile steps go back to each other
              setStep((s) => (s === 3 ? 1 : s - 1));
            }}
            className="font-semibold opacity-85 hover:opacity-100"
          >
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
          <Field label={t.welcome.email} htmlFor="email">
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              dir="ltr"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className={`${inputClass} text-lg`}
            />
            <p className="mt-2 text-sm text-muted">{t.welcome.emailHint}</p>
          </Field>
        )}

        {step === 2 && (
          <div>
            <p className="mb-3 flex items-center gap-2 text-sm text-muted">
              <Mail size={16} className="shrink-0" aria-hidden />
              {t.welcome.codeHint(email.trim())}
            </p>
            <input
              aria-label={t.welcome.codeTitle}
              inputMode="numeric"
              autoComplete="one-time-code"
              dir="ltr"
              autoFocus
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              className={`${inputClass} digits text-center text-3xl font-bold tracking-[0.5em]`}
            />
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setError("");
                setBusy(true);
                await sendCode();
                setBusy(false);
                setResent(true);
              }}
              className="mt-3 text-sm font-semibold text-sky disabled:opacity-50"
            >
              {resent ? t.welcome.codeSent : t.welcome.resend}
            </button>
          </div>
        )}

        {step === 3 && (
          <>
            <Field label={t.profile.nickname} htmlFor="nick">
              <input id="nick" value={nickname} maxLength={24} onChange={(e) => setNickname(e.target.value)} className={inputClass} />
            </Field>
            <Field label={t.profile.fullName} htmlFor="fullName">
              <input id="fullName" value={fullName} maxLength={60} autoComplete="name" onChange={(e) => setFullName(e.target.value)} className={inputClass} />
              <p className="mt-1 text-xs text-muted">{t.welcome.fullNameHint}</p>
            </Field>
            <Field label={t.profile.phone} htmlFor="phone">
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="050-0000000"
                className={`${inputClass} text-start tracking-wider`}
              />
              <p className="mt-1 text-xs text-muted">{t.welcome.phoneHint}</p>
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
            <PartyPicker label={t.profile.party} value={party} onChange={setParty} />
          </>
        )}

        {step === 5 && (
          <>
            <p className="text-sm leading-relaxed text-muted">{t.welcome.referralHint}</p>
            <Field label={t.welcome.referralName} htmlFor="referrerName">
              <input id="referrerName" value={referrerName} maxLength={60} onChange={(e) => setReferrerName(e.target.value)} className={inputClass} />
            </Field>
            <Field label={t.welcome.referralPhone} htmlFor="referrerPhone">
              <input
                id="referrerPhone"
                type="tel"
                inputMode="tel"
                dir="ltr"
                value={referrerPhone}
                onChange={(e) => setReferrerPhone(e.target.value)}
                placeholder="050-0000000"
                className={`${inputClass} text-start tracking-wider`}
              />
            </Field>
          </>
        )}

        {error && (
          <p role="alert" className="text-sm font-medium text-coral">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className={`${primaryButton} w-full py-4`}>
          {step === 1 ? t.welcome.sendCode : step === 2 ? t.welcome.verify : step === 5 ? t.welcome.submit : t.welcome.next}
        </button>
      </div>
    </form>
  );
}

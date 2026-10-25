"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FlaskConical, Lock, RotateCcw } from "lucide-react";
import { AVATAR_IDS, Avatar } from "./Avatar";
import { useT, useToast } from "./Providers";
import { findUser, useApp } from "@/lib/store";
import type { AvatarId, TravelsAs } from "@/lib/types";

const field =
  "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export function Profile() {
  const { users, meId } = useApp();
  const me = findUser(users, meId)!;
  // a fresh form when the "view as" switch changes who you are
  return <ProfileForm key={me.id} />;
}

function ProfileForm() {
  const { t, href } = useT();
  const toast = useToast();
  const router = useRouter();
  const { users, meId, updateProfile, reset } = useApp();
  const me = findUser(users, meId)!;

  const [nickname, setNickname] = useState(me.nickname);
  const [avatar, setAvatar] = useState<AvatarId>(me.avatar);
  const [travelsAs, setTravelsAs] = useState<TravelsAs>(me.travelsAs);
  const [city, setCity] = useState(me.city);
  const [about, setAbout] = useState(me.about);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    updateProfile({ nickname: nickname.trim(), avatar, travelsAs, city: city.trim(), about: about.trim() });
    toast(t.profile.saved);
  };

  const resetDemo = () => {
    reset();
    toast(t.demo.resetDone);
    router.push(href("/"));
  };

  return (
    <div className="space-y-5">
      <form onSubmit={save} className="space-y-5">
        <div className="flex items-center gap-3">
          <Avatar id={avatar} size={64} />
          <div>
            <h1 className="text-2xl font-bold text-ink">{nickname || t.profile.title}</h1>
            <p className="text-sm text-muted">{t.section[me.gender]}</p>
          </div>
        </div>

        <div>
          <label htmlFor="nickname" className="mb-1.5 block text-sm font-semibold text-ink">
            {t.profile.nickname}
          </label>
          <input id="nickname" value={nickname} maxLength={24} required onChange={(e) => setNickname(e.target.value)} className={field} />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink">{t.profile.avatar}</legend>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_IDS.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={avatar === id}
                aria-label={id}
                onClick={() => setAvatar(id)}
                className={`flex items-center justify-center rounded-full p-0.5 transition ${
                  avatar === id ? "ring-2 ring-brand ring-offset-2 ring-offset-sand" : "opacity-80 hover:opacity-100"
                }`}
              >
                <Avatar id={id} size={44} />
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <span className="mb-1.5 block text-sm font-semibold text-ink">{t.profile.gender}</span>
          <div className="flex items-center justify-between rounded-xl bg-cream px-3 py-2.5 ring-1 ring-line">
            <span className="text-ink">{t.gender[me.gender]}</span>
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <Lock size={13} aria-hidden />
              {t.profile.genderLocked}
            </span>
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink">{t.profile.travelsAs}</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["solo", "family"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={travelsAs === v}
                onClick={() => setTravelsAs(v)}
                className={`rounded-xl px-3 py-2.5 text-sm font-medium ring-1 transition ${
                  travelsAs === v ? "bg-brand-soft text-brand-strong ring-brand" : "bg-white text-ink ring-line"
                }`}
              >
                {t.travelsAs[v]}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="city" className="mb-1.5 block text-sm font-semibold text-ink">
            {t.profile.city}
          </label>
          <input id="city" value={city} maxLength={40} onChange={(e) => setCity(e.target.value)} className={field} />
        </div>

        <div>
          <label htmlFor="about" className="mb-1.5 block text-sm font-semibold text-ink">
            {t.profile.about}
          </label>
          <textarea id="about" rows={3} maxLength={200} value={about} onChange={(e) => setAbout(e.target.value)} className={`${field} resize-none`} />
        </div>

        <button type="submit" className="w-full rounded-xl bg-brand py-3 font-semibold text-white hover:bg-brand-strong">
          {t.profile.save}
        </button>
      </form>

      <section className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-amber-900">
          <FlaskConical size={15} aria-hidden />
          {t.demo.tools}
        </h2>
        <button
          type="button"
          onClick={resetDemo}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-amber-900 ring-1 ring-amber-200"
        >
          <RotateCcw size={15} aria-hidden />
          {t.demo.reset}
        </button>
      </section>
    </div>
  );
}

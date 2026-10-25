"use client";

import { Camera, FileText, ShieldCheck } from "lucide-react";
import { Body, Card, PageHeader } from "./ui";
import { useT } from "./Providers";
import { PHOTOS, PHOTO_IDS } from "@/lib/photos";

export function Safety() {
  const { t } = useT();
  return (
    <div>
      <PageHeader title={t.safety.title} back="/profile" />
      <Body className="space-y-4">
        <Card>
          <h2 className="flex items-center gap-2 font-bold text-ink">
            <ShieldCheck size={20} className="text-mint" aria-hidden />
            {t.safety.tipsTitle}
          </h2>
          <ol className="mt-3 space-y-3">
            {t.safety.tips.map((tip, i) => (
              <li key={tip} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-soft text-sm font-bold text-navy">{i + 1}</span>
                <span className="pt-0.5 leading-relaxed text-ink">{tip}</span>
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 font-bold text-ink">
            <Camera size={20} className="text-sky" aria-hidden />
            {t.safety.photosTitle}
          </h2>
          <p className="mt-2 text-sm text-muted">{t.safety.photosText}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            {PHOTO_IDS.map((id, i) => (
              <span key={id}>
                {i > 0 && " · "}
                <a href={PHOTOS[id].unsplash} target="_blank" rel="noreferrer" className="underline decoration-line underline-offset-2 hover:text-sky">
                  {PHOTOS[id].by ?? "Unsplash"}
                </a>
              </span>
            ))}
          </p>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 font-bold text-ink">
            <FileText size={20} className="text-sky" aria-hidden />
            {t.safety.termsTitle}
          </h2>
          <p className="mt-2 text-sm text-muted">{t.safety.termsText}</p>
        </Card>
      </Body>
    </div>
  );
}

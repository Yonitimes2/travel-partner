import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { Providers } from "@/components/Providers";
import { DEFAULT_LANG, LANGS, dictionaries, dirOf, isLang } from "@/lib/i18n";
import "../globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export async function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const t = dictionaries[isLang(lang) ? lang : DEFAULT_LANG];
  return { title: t.appName, description: t.tagline };
}

export const viewport: Viewport = {
  themeColor: "#0b1d4d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang: raw } = await params;
  // the proxy only lets /he and /en through
  const lang = isLang(raw) ? raw : DEFAULT_LANG;

  return (
    <html lang={lang} dir={dirOf(lang)} className={`${heebo.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Providers lang={lang}>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}

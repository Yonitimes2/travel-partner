import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { Providers } from "@/components/Providers";
import { DEFAULT_LANG, LANGS, dictionaries, dirOf, isLang } from "@/lib/i18n";
import { FULL_WIDTH, HERO_PHOTOS, photoSrcSet } from "@/lib/photos";
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

/**
 * Runs in <head> before anything else: the home screen's photo of the day (or the welcome screen's)
 * starts downloading at once, so it's there by the time the app draws it. Same choice as heroOfDay().
 */
const PRELOAD_SCRIPT = `(function(){
var p=location.pathname,s;
if(/^\\/(he|en)\\/?$/.test(p)){var h=${JSON.stringify(HERO_PHOTOS.map((id) => photoSrcSet(id, "avif")))};var d=new Date();s=h[(d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate())%h.length];}
else if(/^\\/(he|en)\\/welcome/.test(p)){s=${JSON.stringify(photoSrcSet("jerusalem-citadel-view", "avif"))};}
if(!s)return;var l=document.createElement("link");l.rel="preload";l.as="image";l.type="image/avif";
l.setAttribute("imagesrcset",s);l.setAttribute("imagesizes",${JSON.stringify(FULL_WIDTH)});l.setAttribute("fetchpriority","high");document.head.appendChild(l);
})();`;

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang: raw } = await params;
  // the proxy only lets /he and /en through
  const lang = isLang(raw) ? raw : DEFAULT_LANG;

  return (
    <html lang={lang} dir={dirOf(lang)} className={`${heebo.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRELOAD_SCRIPT }} />
      </head>
      <body className="min-h-full">
        <Providers lang={lang}>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}

import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth-cookie";

/**
 * Every page lives under /he or /en; anything else goes to the Hebrew version of the same path.
 * Without a session cookie, every page but the welcome screen goes straight there (the app still checks
 * the session itself: an expired one is sent there from the browser). The API (/api/…) is left alone:
 * each route checks who is signed in itself.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const lang = /^\/(he|en)(?=\/|$)/.exec(pathname)?.[1];
  if (!lang) {
    const url = req.nextUrl.clone();
    url.pathname = `/he${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }
  if (!req.cookies.has(SESSION_COOKIE) && !pathname.startsWith(`/${lang}/welcome`)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${lang}/welcome`;
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/|photos/|favicon\\.ico|icon\\.svg|apple-icon\\.png).*)"],
};

import { NextResponse, type NextRequest } from "next/server";

/** every page lives under /he or /en; anything else goes to the Hebrew version of the same path */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (/^\/(he|en)(\/|$)/.test(pathname)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/he${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/|favicon\\.ico).*)"],
};

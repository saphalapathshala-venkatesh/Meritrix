import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "meritrix_session";

const PROTECTED_PREFIXES = ["/dashboard", "/drills", "/account", "/sessions/book"];
const ADMIN_PREFIXES = ["/admin"];
const AUTH_PAGES = ["/login", "/signup", "/register"];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const hasSession = !!req.cookies.get(COOKIE_NAME)?.value;
  const needsAuth = matchesPrefix(pathname, PROTECTED_PREFIXES) || matchesPrefix(pathname, ADMIN_PREFIXES);

  if (needsAuth && !hasSession) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (matchesPrefix(pathname, AUTH_PAGES) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

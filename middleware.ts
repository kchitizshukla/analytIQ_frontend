import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Session cookie set by the FastAPI backend (HTTP-only). Middleware can read it
// server-side for a fast redirect; the backend still enforces real auth on
// every data request. This is a presence check only — signature verification
// happens on the backend.
const SESSION_COOKIE = "analytiq_session";

const PROTECTED = ["/dashboard", "/datasets", "/analytics", "/assistant", "/history", "/settings"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // Unauthenticated users cannot reach protected app routes.
  if (isProtected && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Authenticated users should not sit on the auth landing page.
  if (pathname === "/" && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on the auth landing page and the protected app routes only.
  matcher: ["/", "/dashboard/:path*", "/datasets/:path*", "/analytics/:path*", "/assistant/:path*", "/history/:path*", "/settings/:path*"],
};

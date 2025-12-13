// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = [
  "/home",
  "/profile",
  "/messages",
  "/notifications",
  "/settings",
  "/suggested",
];

// Explicit public auth pages (must not be session-checked)
const AUTH_PUBLIC_ROUTES = [
  "/auth/complete",
  "/auth/callback",
  "/auth/local/login",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Whitelist static and framework paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Explicitly allow auth public routes (important for OAuth flow)
  if (AUTH_PUBLIC_ROUTES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Protect pages
  if (PROTECTED.some((p) => pathname.startsWith(p))) {
    const sessionCookie = req.cookies.get("session")?.value;

    if (!sessionCookie) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/local/login";
      url.search = `?redirect=${encodeURIComponent(req.nextUrl.pathname)}`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// BLOCK MIDDLEWARE from touching /socket.io
export const config = {
  matcher: [
    "/((?!socket\\.io).*)",
  ],
};

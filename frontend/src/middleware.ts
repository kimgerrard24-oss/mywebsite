// frontend/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ⚠️ IMPORTANT
// With SessionService + Redis,
// middleware MUST NOT decide authentication state.
// Auth decision is handled by backend only.

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow Next.js internals & static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Allow all auth-related routes (OAuth flow safe)
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // DO NOT check cookies here
  // DO NOT redirect based on auth here
  // Protected pages must validate session
  // via backend (SSR or client API)

  return NextResponse.next();
}

// Block middleware from touching socket.io
export const config = {
  matcher: [
    "/((?!socket\\.io).*)",
  ],
};

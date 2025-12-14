// frontend/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * IMPORTANT — AUTH ARCHITECTURE NOTE
 *
 * This middleware is a PASS-THROUGH only.
 *
 * ❌ MUST NOT:
 * - Read or validate cookies
 * - Decide authentication state
 * - Redirect based on login/session
 *
 * ✅ Authentication authority lives in BACKEND ONLY:
 * - JWT + Redis
 * - Firebase Admin (OAuth)
 * - /auth/session-check
 *
 * Protected pages must validate session via:
 * - getServerSideProps (SSR)
 * - or client API call
 */

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

  // Intentionally do nothing else
  // Auth decisions are handled by backend
  return NextResponse.next();
}

// Exclude socket.io completely
export const config = {
  matcher: ["/((?!socket\\.io).*)"],
};

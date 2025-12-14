// ==============================
// file: pages/api/me.ts
// ==============================
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * IMPORTANT — READ BEFORE USING
 *
 * This API route runs ONLY inside the Next.js frontend server.
 *
 * ❌ It CANNOT:
 * - Read backend HttpOnly cookies
 * - Validate Firebase Admin sessions
 * - Verify JWT / Redis sessions
 * - Determine real authentication state
 *
 * ❌ DO NOT USE this route for:
 * - Auth guards
 * - SSR authentication
 * - Client auth checks
 *
 * ✅ ALWAYS USE:
 *   GET ${process.env.NEXT_PUBLIC_API_BASE}/auth/session-check
 *
 * That backend endpoint validates:
 * - JWT + Redis session
 * - Firebase Admin verification
 * - Google OAuth
 * - Facebook OAuth
 * - Secure cookies (Domain=.phlyphant.com)
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Explicit method guard
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).end("Method Not Allowed");
    }

    // Security: disable caching
    res.setHeader("Cache-Control", "no-store");

    const API_BASE =
      process.env.NEXT_PUBLIC_API_BASE ||
      "https://api.phlyphant.com";

    const SITE_ORIGIN =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://www.phlyphant.com";

    return res.status(200).json({
      ok: true,
      warning:
        "This is NOT an authentication endpoint. Use backend /auth/session-check instead.",
      recommendedAuthEndpoint: `${API_BASE}/auth/session-check`,

      hybridOAuth: {
        googleLogin: `${API_BASE}/auth/google?origin=${encodeURIComponent(
          SITE_ORIGIN
        )}`,
        facebookLogin: `${API_BASE}/auth/facebook?origin=${encodeURIComponent(
          SITE_ORIGIN
        )}`,
      },
    });
  } catch {
    return res.status(500).json({ ok: false });
  }
}

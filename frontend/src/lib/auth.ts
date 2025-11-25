// ==============================
// frontend/lib/auth.ts
// ==============================

// Helper utilities used during SSR to validate session cookie via backend

import { sessionCheckServerSide } from './api';

export async function validateSessionOnServer(cookieHeader?: string) {
  try {
    // FIX #1 — normalize cookie header safely
    const headerValue =
      typeof cookieHeader === 'string' && cookieHeader.trim().length > 0
        ? cookieHeader
        : '';

    // FIX #2 — ensure correct header name "Cookie" (capital C)
    const result = await sessionCheckServerSide(headerValue);

    if (!result) {
      return { valid: false };
    }

    const data = result as Record<string, any>;

    const valid = data.valid === true;

    const { valid: _ignored, ...rest } = data;

    return {
      valid,
      ...rest,
    };
  } catch {
    return { valid: false };
  }
}

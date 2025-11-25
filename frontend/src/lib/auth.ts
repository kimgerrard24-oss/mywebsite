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

    const result = await sessionCheckServerSide(headerValue);

    if (!result) {
      return { valid: false };
    }

    const data = result as Record<string, any>;

    // ================================================
    // FIX #2 — Use ONLY backend truth:
    // valid = backend.valid === true
    // ================================================
    const valid = data.valid === true;

    // Prevent leaking backend.valid field again
    const { valid: _ignored, ...rest } = data;

    return {
      valid,
      ...rest,
    };
  } catch {
    return { valid: false };
  }
}

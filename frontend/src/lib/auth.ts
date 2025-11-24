// ==============================
// frontend/lib/auth.ts
// ==============================

// Helper utilities used during SSR to validate session cookie via backend

import { sessionCheckServerSide } from './api';

export async function validateSessionOnServer(cookieHeader?: string) {
  try {
    // FIX: ensure cookie header is correctly cased for all environments
    const headerValue = cookieHeader || undefined;

    const result = await sessionCheckServerSide(headerValue);

    if (!result) {
      return { valid: false };
    }

    const data = result as Record<string, any>;

    // Normalize backend response correctly
    const valid =
      data.valid === true ||
      data.sessionCookie === true ||
      data.user != null ||
      data.uid != null;

    // Do NOT spread backend "valid" again
    const { valid: _ignored, ...rest } = data;

    return {
      valid,
      ...rest,
    };
  } catch {
    return { valid: false };
  }
}

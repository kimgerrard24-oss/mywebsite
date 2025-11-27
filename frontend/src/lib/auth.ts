// ==============================
// frontend/lib/auth.ts
// ==============================

import { sessionCheckServerSide } from './api';

export async function validateSessionOnServer(cookieHeader?: string) {
  try {
    const rawCookie =
      typeof cookieHeader === 'string' && cookieHeader.trim().length > 0
        ? cookieHeader
        : '';

    // FIX: pass cookieHeader directly (sessionCheckServerSide expects raw string)
    const result = await sessionCheckServerSide(rawCookie);

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

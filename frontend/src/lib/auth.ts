// ==============================
// frontend/lib/auth.ts
// ==============================

import { sessionCheckServerSide } from './api';

export async function validateSessionOnServer(cookieHeader?: string) {
  try {
    const headerValue =
      typeof cookieHeader === 'string' && cookieHeader.trim().length > 0
        ? cookieHeader
        : '';

    // FIX: send raw cookie string (correct type)
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

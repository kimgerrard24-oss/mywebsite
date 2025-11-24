// frontend/lib/auth.ts
// Helper utilities used during SSR to validate session cookie via backend

import { sessionCheckServerSide } from './api';

export async function validateSessionOnServer(cookieHeader?: string) {
  // Always return a consistent result shape
  try {
    const result = await sessionCheckServerSide(cookieHeader);

    if (!result) {
      return { valid: false };
    }

    // Must always contain at least { valid: boolean }
    if (typeof result.valid !== 'boolean') {
      return { valid: false };
    }

    return result;
  } catch {
    return { valid: false };
  }
}

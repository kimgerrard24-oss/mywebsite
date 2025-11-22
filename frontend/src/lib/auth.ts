// frontend/lib/auth.ts
// Helper utilities used during SSR to validate session cookie via backend
import { sessionCheckServerSide } from './api';

export async function validateSessionOnServer(cookieHeader?: string) {
  // Returns object { valid: boolean, user?: any }
  try {
    const result = await sessionCheckServerSide(cookieHeader);
    return result;
  } catch (e) {
    return { valid: false };
  }
}

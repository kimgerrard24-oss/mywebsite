// lib/auth/auth.service.ts
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // สำคัญ: เพื่อให้เบราว์เซอร์ส่ง/รับ HttpOnly cookies (session)
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // Do not set Authorization header here because we rely on HttpOnly cookie sessions
});

/**
 * Request /auth/local/login
 * - body: { email, password, remember? }
 * - server should set HttpOnly cookie and return safe user object (no sensitive fields)
 */
export async function login(payload: { email: string; password: string; remember?: boolean }) {
  try {
    const resp = await api.post('/auth/local/login', {
      email: payload.email,
      password: payload.password,
      remember: Boolean(payload.remember),
    });

    // Expect server returns { success: boolean, data?: { user }, message?: string }
    return resp.data as {
      success: boolean;
      data?: {
        user?: { id: string; email?: string; username?: string; [k: string]: any };
        expiresIn?: number;
      };
      message?: string;
    };
  } catch (err: any) {
    // Normalize error shape
    if (err?.response?.data) {
      // Server responded with JSON error
      return {
        success: false,
        message: typeof err.response.data?.message === 'string' ? err.response.data.message : 'Login failed',
      };
    }
    // Network error or unexpected
    return {
      success: false,
      message: 'Network error',
    };
  }
}

/**
 * Optional: a helper to fetch current user (if session cookie exists)
 */
export async function fetchCurrentUser() {
  try {
    const resp = await api.get('/auth/me');
    return resp.data;
  } catch {
    return null;
  }
}

export default {
  login,
  fetchCurrentUser,
};

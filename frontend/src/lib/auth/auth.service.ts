// lib/auth/auth.service.ts
import axios from 'axios';

const rawBase = (process.env.NEXT_PUBLIC_API_URL || '').trim();
const API_BASE = rawBase.replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 10000,
  maxRedirects: 5,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export async function login(payload: { email: string; password: string; remember?: boolean }) {
  try {
    const resp = await api.post('/auth/local/login', {
      email: payload.email,
      password: payload.password,
      remember: Boolean(payload.remember),
    });

    return resp.data as {
      success: boolean;
      data?: {
        user?: { id: string; email?: string; username?: string; [k: string]: any };
        expiresIn?: number;
      };
      message?: string;
    };
  } catch (err: any) {
    if (err?.response?.data) {
      const message = typeof err.response.data?.message === 'string'
        ? err.response.data.message
        : 'Login failed';

      return {
        success: false,
        message,
      };
    }

    return {
      success: false,
      message: 'Network error',
    };
  }
}

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

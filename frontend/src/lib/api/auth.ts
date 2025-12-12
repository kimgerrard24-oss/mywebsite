// ==============================
// frontend/lib/api/auth.ts
// FIXED — Consistent with backend + axios instance
// ==============================

import axios, { AxiosError } from "axios";

// Normalize Base URL from ANY of the allowed env vars
const rawBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.phlyphant.com";

const baseURL = rawBase.replace(/\/+$/, "");

// Unified client instance
const client = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

// ==================================================
// REGISTER
// ==================================================
export async function registerUser(body: {
  email: string;
  username: string;
  password: string;
  turnstileToken: string;
}) {
  const res = await client.post("/auth/local/register", body);
  return res.data;
}

// ==================================================
// EMAIL VERIFY
// ==================================================
export async function verifyEmail(token: string) {
  const encodedToken = encodeURIComponent(token);
  const res = await client.get(`/auth/local/verify-email?token=${encodedToken}`);
  return res.data;
}

export interface ApiSuccessResponse {
  message?: string;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
}

// ==================================================
// REQUEST PASSWORD RESET
// ==================================================
export async function requestPasswordReset(email: string): Promise<string> {
  try {
    const res = await client.post<ApiSuccessResponse>(
      "/auth/local/request-password-reset",
      { email },
      {
        withCredentials: false,
      }
    );

    return (
      res.data?.message ||
      "If an account exists for this email, a password reset link has been sent."
    );
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to process your request at the moment."
    );
  }
}

// ==================================================
// RESET PASSWORD
// ==================================================
export interface ResetPasswordPayload {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<string> {
  try {
    const res = await client.post<ApiSuccessResponse>(
      "/auth/local/reset-password",
      payload,
      { withCredentials: false }
    );

    return (
      res.data?.message ||
      "If the reset link is valid, your password has been updated."
    );
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;

    if (error.response?.status === 410) {
      throw new Error("Your reset link has expired. Please request a new one.");
    }

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to reset your password at this moment."
    );
  }
}

// ==================================================
// GET PROFILE (FIXED)
// Backend might return:
// 1) { data: { ...user } }
// 2) { id, email, ... }
// ==================================================
export async function getProfile() {
  try {
    const res = await client.get("/users/me");

    if (!res.data) return null;

    if (typeof res.data === "object") {
      // Backend v1: { data: { ... } }
      if (res.data.data && typeof res.data.data === "object") {
        return res.data.data;
      }

      // Backend v2: { id, email, ... } (current)
      if (res.data.id) {
        return res.data;
      }
    }

    return null;
  } catch {
    return null;
  }
}

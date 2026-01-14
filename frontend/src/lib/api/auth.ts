// ==============================
// frontend/lib/api/auth.ts
// FIXED — Hardened for production auth flow
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

// --------------------------------------------------
// Ensure credentials are ALWAYS sent (auth safety)
// --------------------------------------------------
client.interceptors.request.use((config) => {
  config.withCredentials = true;
  return config;
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
export async function verifyEmail(uid: string, token: string) {
  const res = await client.get(
    `/auth/local/verify-email?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}`
  );
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

export async function resetPassword(
  payload: ResetPasswordPayload
): Promise<string> {
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
// GET PROFILE (HARDENED FOR HYBRID AUTH)
// return:
//   UserProfile   → success
//   null          → definitely not logged in (401)
//   undefined     → session may exist but resource not ready
// ==================================================
export async function getProfile() {
  try {
    const res = await client.get("/users/me");

    if (!res.data) return undefined;

    if (typeof res.data === "object") {
      // Backend v1
      if (res.data.data && typeof res.data.data === "object") {
        return res.data.data;
      }

      // Backend v2 (current)
      if (res.data.id) {
        return res.data;
      }
    }

    return undefined;
  } catch (err) {
    const error = err as AxiosError;

    // 401 = definitely not logged in
    if (error.response?.status === 401) {
      return null;
    }

    // 5xx / network / race condition
    // Do NOT treat as logout
    if (process.env.NODE_ENV !== "production") {
      console.warn("[getProfile] transient error", error);
    }

    return undefined;
  }
}

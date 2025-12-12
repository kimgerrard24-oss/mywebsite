// ==============================
// lib/auth/auth.service.ts
// FINAL FIXED VERSION
// ==============================

import { api } from "../api/api";

// Normalized API Base (match entire frontend)
const rawBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.phlyphant.com";

const API_BASE = rawBase.replace(/\/+$/, "");

// ==============================
// LOGIN
// ==============================
export async function login(payload: {
  email: string;
  password: string;
  remember?: boolean;
}) {
  try {
    const res = await api.post("/auth/local/login", {
      email: payload.email,
      password: payload.password,
      remember: Boolean(payload.remember),
    });

    return res.data;
  } catch (err: any) {
    const message =
      err?.response?.data?.message ??
      "Login failed";

    return { success: false, message };
  }
}

// ==============================
// FETCH CURRENT USER (CORRECT ROUTE)
// ==============================
export async function fetchCurrentUser() {
  try {
    // Correct protected endpoint
    const res = await api.get("/users/me");
    return res.data;
  } catch {
    return null;
  }
}

// ==============================
// LOGOUT
// ==============================
export async function logout(): Promise<void> {
  try {
    await api.post("/auth/local/logout", {});
  } catch (err: any) {
    console.warn("logout error:", err?.message || "Logout failed");
  }
}

// ==============================
// REFRESH TOKEN
// ==============================
export async function refreshAccessToken() {
  const res = await api.post(
    "/auth/local/refresh",
    {},
    { withCredentials: true }
  );
  return res.data;
}

export default {
  login,
  fetchCurrentUser,
  logout,
  refreshAccessToken,
};

// ==============================
// lib/auth/auth.service.ts
// FINAL FIXED VERSION (Correct Cookie-Based Auth)
// ==============================

import { api } from "../api/api";

// Normalize API base URL
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
    const message = err?.response?.data?.message ?? "Login failed";
    return { success: false, message };
  }
}

// ==============================
// FETCH CURRENT USER (FULLY FIXED)
// Must handle both backend formats:
// 1) { data: {...} }
// 2) { id, email, ... }
// ==============================
export async function fetchCurrentUser() {
  try {
    const res = await api.get("/users/me");

    const body = res.data;

    // format 1: { data: {...} }
    if (body && typeof body === "object" && body.data) {
      return body.data;
    }

    // format 2: user object directly
    if (body && typeof body === "object" && body.id) {
      return body;
    }

    return null;
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
// REFRESH TOKEN — FIXED
// Backend rotates cookie silently
// ==============================
export async function refreshAccessToken(): Promise<boolean> {
  try {
    await api.post("/auth/local/refresh", {});
    return true;
  } catch {
    return false;
  }
}

export default {
  login,
  fetchCurrentUser,
  logout,
  refreshAccessToken,
};

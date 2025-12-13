// ==============================
// lib/auth/auth.service.ts
// FINAL FIXED VERSION (Hardened for production)
// ==============================

import { api } from "../api/api";

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
// FETCH CURRENT USER
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
  } catch (err: any) {
    // 401 = not authenticated yet (normal case)
    if (err?.response?.status === 401) {
      return null;
    }

    // Other errors: silent log for non-production
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[fetchCurrentUser] unexpected error",
        err?.message || err
      );
    }

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

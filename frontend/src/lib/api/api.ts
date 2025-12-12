// ==============================
// frontend/lib/api.ts
// Unified API Client (FINAL FIXED)
// ==============================

import axios from "axios";

// ==============================
// BASE URL
// ==============================
const rawBase =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://api.phlyphant.com";

export const API_BASE = rawBase.replace(/\/+$/, "");

// ==============================
// Normalize path
// ==============================
function apiPath(path: string): string {
  if (!path.startsWith("/")) return `${API_BASE}/${path}`;
  return `${API_BASE}${path}`;
}

// ==============================
// Generic JSON Fetch (SSR/CSR Safe)
// ==============================
async function jsonFetch<T>(input: string, init: RequestInit = {}): Promise<T> {
  const hasBody = typeof init.body !== "undefined";

  const res = await fetch(input, {
    credentials: init.credentials ?? "include",
    ...init,
    headers: {
      Accept: "application/json",
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    let errBody: any = errText;
    try {
      errBody = JSON.parse(errText);
    } catch {}
    const err: any = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    err.body = errBody;
    throw err;
  }

  const type = res.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) {
    return (await res.text()) as T;
  }

  return (await res.json()) as T;
}

// ==============================
// AXIOS INSTANCE (CSR Only)
// ==============================
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 12000,
});

api.interceptors.request.use((cfg) => {
  const method = cfg.method?.toLowerCase();
  cfg.headers = cfg.headers ?? {};

  if (
    ["post", "put", "patch"].includes(method ?? "") &&
    cfg.data &&
    typeof cfg.data === "object" &&
    !(cfg.data instanceof FormData)
  ) {
    cfg.headers["Content-Type"] = "application/json";
  }

  return cfg;
});

// ==============================
// Public API Wrapper (Corrected)
// ==============================
export async function apiGet<T = any>(path: string, config: any = {}): Promise<T> {
  const res = await api.get(path, config);
  return res.data;
}

export async function apiPost<T = any>(
  path: string,
  body?: any,
  config: any = {}
): Promise<T> {
  const res = await api.post(path, body, config);
  return res.data;
}

export async function apiPut<T = any>(
  path: string,
  body?: any,
  config: any = {}
): Promise<T> {
  const res = await api.put(path, body, config);
  return res.data;
}

export async function apiDelete<T = any>(
  path: string,
  config: any = {}
): Promise<T> {
  const res = await api.delete(path, config);
  return res.data;
}

// ==============================
// Client Fetch Wrapper (CSR)
// ==============================
export const client = {
  get: <T = any>(path: string) =>
    jsonFetch<T>(apiPath(path), { method: "GET", credentials: "include" }),

  post: <T = any>(path: string, data?: any) =>
    jsonFetch<T>(apiPath(path), {
      method: "POST",
      body: JSON.stringify(data ?? {}),
      credentials: "include",
    }),
};

// ==============================
// AUTH / SESSION
// ==============================
export async function createSessionCookie(idToken: string) {
  return client.post("/auth/complete", { idToken });
}

export async function logout() {
  return client.post("/auth/logout");
}

// ==============================
// SESSION CHECK (SSR) — FIXED
// ==============================
export async function sessionCheckServerSide(cookieHeader?: string) {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  // FIX: must use "Cookie" capitalized so backend receives it in SSR
  if (cookieHeader && cookieHeader.trim()) {
    headers["Cookie"] = cookieHeader;
  }

  const res = await fetch(apiPath("/auth/session-check"), {
    method: "GET",
    headers,
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) return { valid: false };

  try {
    const data = await res.json().catch(() => null);
    return { valid: data?.valid === true, ...data };
  } catch {
    return { valid: false };
  }
}

// ==============================
// SESSION CHECK (Client)
// ==============================
export async function sessionCheckClient() {
  const data = await jsonFetch<Record<string, any>>(apiPath("/auth/session-check"), {
    credentials: "include",
  });

  return { valid: data.valid === true, ...data };
}

// ==============================
// VERIFY EMAIL
// ==============================
export async function verifyEmail(token: string, uid: string) {
  return client.get(`/auth/verify-email?token=${token}&uid=${uid}`);
}

// ==============================
// REFRESH TOKEN (returns boolean)
// ==============================
export async function refreshAccessToken(): Promise<boolean> {
  try {
    await api.post("/auth/local/refresh", {});
    return true;
  } catch {
    return false;
  }
}

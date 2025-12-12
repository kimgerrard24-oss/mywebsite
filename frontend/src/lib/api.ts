// ==============================
// frontend/lib/api.ts
// Unified API Client (FINAL VERSION)
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
// Helper: Build full path
// ==============================
function apiPath(path: string): string {
  return path.startsWith("/") ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
}

// ==============================
// JSON Fetch (SSR Safe)
// ==============================
async function jsonFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const hasBody = typeof init?.body !== "undefined";

  const res = await fetch(input, {
    credentials: init?.credentials ?? "same-origin",
    ...init,
    headers: {
      Accept: "application/json",
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ? (init.headers as Record<string, string>) : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let body = text;
    try {
      body = text ? JSON.parse(text) : text;
    } catch {}

    const err: any = new Error(`Request failed: ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  const type = res.headers.get("content-type");
  if (!type?.includes("application/json")) {
    return (await res.text()) as T;
  }

  return (await res.json()) as T;
}

// ==============================
// AXIOS INSTANCE (main client)
// ==============================
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // IMPORTANT for cookie auth
  timeout: 12000,
});

// Axios Interceptor
api.interceptors.request.use((cfg: any) => {
  const method = cfg.method?.toLowerCase() ?? "";
  cfg.headers = cfg.headers ?? {};

  if (
    ["post", "put", "patch"].includes(method) &&
    cfg.data &&
    typeof cfg.data === "object" &&
    !(cfg.data instanceof FormData)
  ) {
    cfg.headers["Content-Type"] = "application/json";
  }

  return cfg;
});

// ==============================
// Minimal Fetch Client
// ==============================
export const client = {
  get: <T = any>(path: string) =>
    jsonFetch<T>(apiPath(path), {
      method: "GET",
      credentials: "include",
    }),

  post: <T = any>(path: string, data?: any) =>
    jsonFetch<T>(apiPath(path), {
      method: "POST",
      body: JSON.stringify(data ?? {}),
      credentials: "include",
    }),
};

// ==============================
// API WRAPPERS (from apiClient.ts)
// ==============================
export async function apiGet<T = unknown>(path: string, config: any = {}): Promise<T> {
  const res = await api.get<T>(path, config);
  return res.data;
}

export async function apiPost<T = unknown>(path: string, body?: any, config: any = {}): Promise<T> {
  const res = await api.post<T>(path, body, config);
  return res.data;
}

export async function apiPut<T = unknown>(path: string, body?: any, config: any = {}): Promise<T> {
  const res = await api.put<T>(path, body, config);
  return res.data;
}

export async function apiDelete<T = unknown>(path: string, config: any = {}): Promise<T> {
  const res = await api.delete<T>(path, config);
  return res.data;
}

// ==============================
// AUTH / SESSION
// ==============================
export async function createSessionCookie(idToken: string) {
  return client.post<{ ok: true }>("/auth/complete", { idToken });
}

export async function logout() {
  return client.post("/auth/logout");
}

// Session Check (SSR)
export async function sessionCheckServerSide(cookieHeader?: string) {
  const res = await fetch(apiPath("/auth/session-check"), {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(cookieHeader ? { cookie: cookieHeader, Cookie: cookieHeader } : {}),
    },
  });

  if (!res.ok) return { valid: false };

  try {
    const data = await res.json();
    return { valid: data.valid === true, ...data };
  } catch {
    return { valid: false };
  }
}

// Session Check (Client)
export async function sessionCheckClient() {
  const data = await jsonFetch<Record<string, any>>(apiPath("/auth/session-check"), {
    credentials: "include",
  });

  return { valid: data.valid === true, ...data };
}

// Email Verify
export async function verifyEmail(token: string, uid: string) {
  return client.get(`/auth/verify-email?token=${token}&uid=${uid}`);
}

// Refresh Access Token
export async function refreshAccessToken() {
  const res = await api.post("/auth/local/refresh", {});
  return res.data;
}

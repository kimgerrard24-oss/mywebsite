// ==============================
// frontend/lib/api.ts
// Unified API Client (Final Version)
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
  if (!path.startsWith("/")) return `${API_BASE}/${path}`;
  return `${API_BASE}${path}`;
}

// ==============================
// SSR / Fetch JSON Wrapper
// ==============================
async function jsonFetch<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
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
  if (!type || !type.includes("application/json")) {
    return (await res.text()) as T;
  }

  return (await res.json()) as T;
}

// ==============================
// 1) Axios Instance (main client)
// ==============================
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // critical for phl_access cookie
  timeout: 12000,
});

// Request Interceptor
api.interceptors.request.use((cfg) => {
  const method = cfg.method?.toLowerCase() ?? "";

  // Auto add Content-Type if JSON body
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
// 2) Minimal Fetch Client
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
// 3) Session / Auth Operations
// ==============================

// Used by Social OAuth Callback → Backend issues session cookie
export async function createSessionCookie(idToken: string) {
  return client.post<{ ok: true }>("/auth/complete", { idToken });
}

// Universal logout (Local + Social)
export async function logout() {
  return client.post("/auth/logout");
}

// ------------------------------
// SESSION CHECK — SSR
// ------------------------------
export async function sessionCheckServerSide(cookieHeader?: string) {
  const url = apiPath("/auth/session-check");

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(cookieHeader
        ? { cookie: cookieHeader, Cookie: cookieHeader }
        : {}),
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

// ------------------------------
// SESSION CHECK — Client
// ------------------------------
export async function sessionCheckClient(): Promise<{
  valid: boolean;
  user?: any;
  [key: string]: any;
}> {
  const data = await jsonFetch<Record<string, any>>(apiPath("/auth/session-check"), {
    credentials: "include",
  });

  return {
    valid: data.valid === true,
    ...data,
  };
}


// ------------------------------
// Email Verify
// ------------------------------
export async function verifyEmail(token: string, uid: string) {
  return client.get(`/auth/verify-email?token=${token}&uid=${uid}`);
}

// ------------------------------
// Refresh Access Token
// ------------------------------
export async function refreshAccessToken() {
  const res = await api.post("/auth/local/refresh", {});
  return res.data; // { accessToken, user, valid }
}

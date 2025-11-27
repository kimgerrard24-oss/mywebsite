// ==============================
// file: src/lib/apiClient.ts
// ==============================

import axios, { InternalAxiosRequestConfig } from "axios";

const rawBase =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://api.phlyphant.com";

// FIX: normalize base URL
const baseURL = rawBase.replace(/\/+$/, "");

// axios instance
const API = axios.create({
  baseURL,
  // FIX: do not force credentials globally
  withCredentials: false,
  timeout: 10000,
  headers: {
    // FIX: remove forced cache headers from defaults
    Accept: "application/json",
  },
});

// FIX: interceptor unsafe header removal
API.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  // credentials: only enabled if caller requests it
  if (typeof cfg.withCredentials === "undefined") {
    cfg.withCredentials = false;
  }

  // FIX: content-type only for body
  if (
    cfg.method &&
    ["post", "put", "patch"].includes(cfg.method.toLowerCase())
  ) {
    cfg.headers["Content-Type"] = "application/json";
  }

  // FIX: do NOT force Cache-Control headers here
  return cfg;
});

// Minimal, safe path normalizer
function normalizePath(path: string): string {
  if (!path) return "/";
  if (!path.startsWith("/")) return `/${path}`;
  return path;
}

export async function apiGet<T = unknown>(
  path: string,
  config: any = {}
): Promise<T> {
  const res = await API.get<T>(normalizePath(path), {
    ...config,
  });
  return res.data;
}

export async function apiPost<T = unknown>(
  path: string,
  body?: unknown,
  config: any = {}
): Promise<T> {
  const res = await API.post<T>(normalizePath(path), body, {
    ...config,
  });
  return res.data;
}

export async function apiPut<T = unknown>(
  path: string,
  body?: unknown,
  config: any = {}
): Promise<T> {
  const res = await API.put<T>(normalizePath(path), body, {
    ...config,
  });
  return res.data;
}

export async function apiDelete<T = unknown>(
  path: string,
  config: any = {}
): Promise<T> {
  const res = await API.delete<T>(normalizePath(path), {
    ...config,
  });
  return res.data;
}

export default API;

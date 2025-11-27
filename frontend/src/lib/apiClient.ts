// ==============================
// file: src/lib/apiClient.ts
// ==============================

import axios, { InternalAxiosRequestConfig } from "axios";

const rawBase =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://api.phlyphant.com";

// normalize base URL
const baseURL = rawBase.replace(/\/+$/, "");

// axios instance — important: DO NOT force withCredentials globally
const API = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: undefined,
  headers: {
    Accept: "application/json",
  },
});

// request interceptor
API.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  // allow caller to control withCredentials safely
  if (typeof cfg.withCredentials === "undefined") {
    cfg.withCredentials = false;
  }

  // content-type: set only if JSON body provided
  const method = cfg.method ? cfg.method.toLowerCase() : "";

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

// normalize path
function normalizePath(path: string): string {
  if (!path) return "/";
  if (!path.startsWith("/")) return `/${path}`;
  return path;
}

// ================================
// API wrapper functions
// ================================
export async function apiGet<T = unknown>(
  path: string,
  config: any = {}
): Promise<T> {
  const res = await API.get<T>(normalizePath(path), {
    ...config,
    // caller must control credentials
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

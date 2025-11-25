// ==============================
// file: src/lib/apiClient.ts
// ==============================

import axios, { InternalAxiosRequestConfig } from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://api.phlyphant.com";

// Create axios instance
const API = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    // Remove Content-Type from default headers (GET must not send it)
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    Expires: "0",
  },
  timeout: 10000,
});

// Force cookies
API.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  cfg.withCredentials = true;

  // Only set Content-Type for requests with body
  if (
    cfg.method &&
    ["post", "put", "patch"].includes(cfg.method.toLowerCase())
  ) {
    cfg.headers["Content-Type"] = "application/json";
  }

  cfg.headers["Cache-Control"] = "no-store";
  cfg.headers["Pragma"] = "no-cache";
  cfg.headers["Expires"] = "0";

  return cfg;
});

// Minimal, safe path normalizer
function normalizePath(path: string): string {
  if (!path) return "/";
  // If full path already, return as-is
  if (path.startsWith("/")) return path;
  // Prevent accidental removal of relative paths
  return `/${path}`;
}

export async function apiGet<T = unknown>(path: string, config: any = {}): Promise<T> {
  const res = await API.get<T>(normalizePath(path), config);
  return res.data;
}

export async function apiPost<T = unknown>(path: string, body?: unknown, config: any = {}): Promise<T> {
  const res = await API.post<T>(normalizePath(path), body, config);
  return res.data;
}

export async function apiPut<T = unknown>(path: string, body?: unknown, config: any = {}): Promise<T> {
  const res = await API.put<T>(normalizePath(path), body, config);
  return res.data;
}

export async function apiDelete<T = unknown>(path: string, config: any = {}): Promise<T> {
  const res = await API.delete<T>(normalizePath(path), config);
  return res.data;
}

export default API;

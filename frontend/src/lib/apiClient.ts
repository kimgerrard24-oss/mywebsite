// ==============================
// file: src/lib/apiClient.ts
// ==============================

import axios, { InternalAxiosRequestConfig } from "axios";

// -------------------------------------------------------
// Backend Base URL Resolution (Production Safe)
// Priority:
// 1) NEXT_PUBLIC_BACKEND_URL
// 2) NEXT_PUBLIC_API_BASE
// 3) Default Production API
// -------------------------------------------------------
const baseURL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://api.phlyphant.com";

// -------------------------------------------------------
// Axios Instance (with Production security hardening)
// -------------------------------------------------------
const API = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    Expires: "0",
  },
  timeout: 10000,
});

// -------------------------------------------------------
// Request Interceptor (Enforce no-cache)
// -------------------------------------------------------
API.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  cfg.headers["Cache-Control"] = "no-store";
  cfg.headers["Pragma"] = "no-cache";
  cfg.headers["Expires"] = "0";
  return cfg;
});

// -------------------------------------------------------
// Safe path normalization
// -------------------------------------------------------
function normalizePath(path: string): string {
  if (!path) return "/";
  return `/${path.replace(/^\/+/, "")}`;
}

// -------------------------------------------------------
// HTTP Helpers (Type-Safe)
// -------------------------------------------------------
export async function apiGet<T = unknown>(
  path: string,
  config: any = {}
): Promise<T> {
  const res = await API.get<T>(normalizePath(path), config);
  return res.data;
}

export async function apiPost<T = unknown>(
  path: string,
  body?: unknown,
  config: any = {}
): Promise<T> {
  const res = await API.post<T>(normalizePath(path), body, config);
  return res.data;
}

export async function apiPut<T = unknown>(
  path: string,
  body?: unknown,
  config: any = {}
): Promise<T> {
  const res = await API.put<T>(normalizePath(path), body, config);
  return res.data;
}

export async function apiDelete<T = unknown>(
  path: string,
  config: any = {}
): Promise<T> {
  const res = await API.delete<T>(normalizePath(path), config);
  return res.data;
}

export default API;

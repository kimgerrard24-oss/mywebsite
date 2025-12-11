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

// axios instance — do NOT force withCredentials globally
const API = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: undefined, // caller must control it
  headers: {
    Accept: "application/json",
  },
});

// -----------------------------------------------------
// FIXED: remove forced withCredentials = false
// Now caller fully controls cookie behavior
// -----------------------------------------------------
API.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  // ถ้า caller ไม่กำหนด withCredentials → ปล่อยว่างไว้ (สำคัญสำหรับ SameSite=None)
  // ไม่บังคับ cfg.withCredentials = false อีกต่อไป

  const method = cfg.method ? cfg.method.toLowerCase() : "";

  // content-type: set only if JSON body provided
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
    // caller controls withCredentials
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

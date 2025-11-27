// ==============================
// file: src/lib/axios.ts
// ==============================

import axios from "axios";

// resolve API base
const rawBase =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://api.phlyphant.com";

// normalize URL
const API_BASE = rawBase.replace(/\/+$/, "");

// Create axios instance (safe defaults)
const instance = axios.create({
  baseURL: API_BASE,
  // IMPORTANT: let caller decide withCredentials (must NOT force here)
  withCredentials: undefined,
  timeout: 10000,
  headers: {
    Accept: "application/json",

    // IMPORTANT:
    // do NOT set Content-Type globally (breaks OAuth requests without body)
    // Content-Type must be added by caller only when sending JSON body
  },
});

// ---------------------------------------------
// Request Interceptor (safe for Hybrid OAuth)
// ---------------------------------------------
instance.interceptors.request.use((config) => {
  // Ensure caller controls cookies
  if (typeof config.withCredentials === "undefined") {
    config.withCredentials = false;
  }

  const h: any = config.headers ?? {};

  // Set Content-Type *only* if body exists AND body is JSON
  const method = config.method ? config.method.toLowerCase() : "";

  if (
    ["post", "put", "patch"].includes(method) &&
    config.data &&
    typeof config.data === "object" &&
    !(config.data instanceof FormData)
  ) {
    h["Content-Type"] = "application/json";
  }

  // Ensure Accept header exists
  if (!h["Accept"]) {
    h["Accept"] = "application/json";
  }

  config.headers = h;
  return config;
});

export default instance;

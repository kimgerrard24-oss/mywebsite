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
  // IMPORTANT: let caller decide withCredentials
  withCredentials: undefined,
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

// ---------------------------------------------
// FIXED Request Interceptor
// ---------------------------------------------
instance.interceptors.request.use((config) => {
  // DO NOT override withCredentials
  // Caller must explicitly set it
  // Example: axios.get(url, { withCredentials: true })

  const headers: any = config.headers ?? {};
  const method = config.method ? config.method.toLowerCase() : "";

  // Add Content-Type ONLY when sending JSON body
  if (
    ["post", "put", "patch"].includes(method) &&
    config.data &&
    typeof config.data === "object" &&
    !(config.data instanceof FormData)
  ) {
    headers["Content-Type"] = "application/json";
  }

  if (!headers["Accept"]) {
    headers["Accept"] = "application/json";
  }

  config.headers = headers;
  return config;
});

// ==============================
// EXPORTS
// ==============================
export { API_BASE };
export default instance;

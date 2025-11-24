// ==============================
// file: src/lib/axios.ts
// ==============================

import axios from "axios";

// Production API base resolution
// Priority (corrected):
// 1) NEXT_PUBLIC_BACKEND_URL
// 2) NEXT_PUBLIC_API_BASE
// 3) Default: https://api.phlyphant.com
const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://api.phlyphant.com";

// Axios instance configured for Production
const instance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    Expires: "0",
  },
  timeout: 10000,
});

// Enforce no-cache rule on all outbound requests
instance.interceptors.request.use((config) => {
  config.headers["Cache-Control"] = "no-store";
  config.headers["Pragma"] = "no-cache";
  config.headers["Expires"] = "0";
  return config;
});

export default instance;

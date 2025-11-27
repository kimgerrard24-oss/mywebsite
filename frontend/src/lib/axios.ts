// ==============================
// file: src/lib/axios.ts
// ==============================

import axios from "axios";

// Production API base resolution
const rawBase =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://api.phlyphant.com";

// normalize: remove trailing slash
const API_BASE = rawBase.replace(/\/+$/, "");

// Create axios instance
const instance = axios.create({
  baseURL: API_BASE,
  // FIX: remove global withCredentials; set per-request explicitly
  withCredentials: false,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// -----------------------------------------------------
// FIX — remove forced credentials + forced cache headers
// -----------------------------------------------------
instance.interceptors.request.use((config) => {
  // allow caller to choose withCredentials
  if (typeof config.withCredentials === "undefined") {
    config.withCredentials = false;
  }

  // ensure headers object exists
  const h: any = config.headers ?? {};

  // do not force Cache-Control, Pragma, Expires here
  // let the caller decide (unhealthy to force)

  // ensure Accept header exists
  if (!h["Accept"] && !(h.get && h.get("Accept"))) {
    if (typeof h.set === "function") {
      h.set("Accept", "application/json");
    } else {
      h["Accept"] = "application/json";
    }
  }

  config.headers = h;
  return config;
});

export default instance;

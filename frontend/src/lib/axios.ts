// ==============================
// file: src/lib/axios.ts
// ==============================

import axios from "axios";

// Production API base resolution (correct priority)
const rawBase =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://api.phlyphant.com";

// normalize: always ensure base URL has no trailing slash
const API_BASE = rawBase.replace(/\/+$/, "");

// Create axios instance
const instance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Cache-Control": "no-store",
    Pragma: "no-cache",
    Expires: "0",
  },
  timeout: 10000,
});

// -----------------------------------------------------
// FIX #1 — Enforce withCredentials = true on every call
// -----------------------------------------------------
instance.interceptors.request.use((config) => {
  config.withCredentials = true; // critical fix

  // no-cache enforced
  config.headers["Cache-Control"] = "no-store";
  config.headers["Pragma"] = "no-cache";
  config.headers["Expires"] = "0";

  // enforce Accept header
  if (!config.headers["Accept"]) {
    config.headers["Accept"] = "application/json";
  }

  return config;
});

export default instance;

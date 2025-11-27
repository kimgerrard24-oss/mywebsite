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
// FIX — ensure headers always exist & set safely
// -----------------------------------------------------
instance.interceptors.request.use((config) => {
  config.withCredentials = true;

  const h: any = config.headers ?? {};

  if (typeof h.set === "function") {
    h.set("Cache-Control", "no-store");
    h.set("Pragma", "no-cache");
    h.set("Expires", "0");
    if (!h.get("Accept")) {
      h.set("Accept", "application/json");
    }
  } else {
    h["Cache-Control"] = "no-store";
    h["Pragma"] = "no-cache";
    h["Expires"] = "0";
    if (!h["Accept"]) {
      h["Accept"] = "application/json";
    }
  }

  config.headers = h;
  return config;
});

export default instance;

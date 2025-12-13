// ==============================
// frontend/lib/api/user.ts
// FIXED — Hardened for CSR/SSR consistency
// ==============================

import axios, { AxiosInstance, AxiosError } from "axios";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

const PUBLIC_API_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://api.phlyphant.com"
);

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt?: string;
}

// ==============================
// CSR (Browser)
// ==============================
const apiClient: AxiosInstance = axios.create({
  baseURL: PUBLIC_API_BASE_URL,
  withCredentials: true,
});

// Ensure credentials are always sent (auth safety)
apiClient.interceptors.request.use((config) => {
  config.withCredentials = true;
  return config;
});

export async function fetchMyProfileClient(): Promise<UserProfile | null> {
  try {
    const response = await apiClient.get("/users/me");
    const data = response.data;

    // backend format 1: { data: {...} }
    if (data && typeof data === "object" && data.data) {
      return data.data;
    }

    // backend format 2: { id, email, ... }
    if (data && typeof data === "object" && data.id) {
      return data;
    }

    return null;
  } catch (err) {
    const error = err as AxiosError;

    // 401 = not logged in yet (normal case)
    if (error.response?.status === 401) {
      return null;
    }

    // Other errors: silent log for non-production
    if (process.env.NODE_ENV !== "production") {
      console.warn("[fetchMyProfileClient] unexpected error", error);
    }

    return null;
  }
}

// ==============================
// SSR (Node Runtime)
// ==============================
export async function fetchMyProfileServer(
  cookieHeader: string | undefined
): Promise<{ profile: UserProfile | null; status: number }> {
  const baseUrl = normalizeBaseUrl(PUBLIC_API_BASE_URL);

  const response = await fetch(`${baseUrl}/users/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  const status = response.status;

  if (status >= 200 && status < 300) {
    const json = await response.json().catch(() => null);

    if (!json) {
      return { profile: null, status };
    }

    // backend format 1: { data: {...} }
    if (json.data && typeof json.data === "object") {
      return { profile: json.data, status };
    }

    // backend format 2: object user directly returned
    if (json.id) {
      return { profile: json, status };
    }

    return { profile: null, status };
  }

  return { profile: null, status };
}

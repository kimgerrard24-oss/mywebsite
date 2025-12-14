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

/**
 * return:
 *   UserProfile  → success
 *   null         → definitely not logged in (401)
 *   undefined    → session may exist but resource not ready (5xx / race)
 */
export async function fetchMyProfileClient(): Promise<
  UserProfile | null | undefined
> {
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

    return undefined;
  } catch (err) {
    const error = err as AxiosError;

    // 401 = definitely not logged in
    if (error.response?.status === 401) {
      return null;
    }

    // 5xx / network / timing issue
    if (process.env.NODE_ENV !== "production") {
      console.warn("[fetchMyProfileClient] transient error", error);
    }

    return undefined;
  }
}

// ==============================
// SSR (Node Runtime)
// ==============================
export async function fetchMyProfileServer(
  cookieHeader: string | undefined
): Promise<{
  profile: UserProfile | null | undefined;
  status: number;
}> {
  const baseUrl = normalizeBaseUrl(PUBLIC_API_BASE_URL);

  try {
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

    // 401 = definitely not logged in
    if (status === 401) {
      return { profile: null, status };
    }

    // 2xx = try parse profile
    if (status >= 200 && status < 300) {
      const json = await response.json().catch(() => null);

      if (!json) {
        return { profile: undefined, status };
      }

      // backend format 1
      if (json.data && typeof json.data === "object") {
        return { profile: json.data, status };
      }

      // backend format 2
      if (json.id) {
        return { profile: json, status };
      }

      return { profile: undefined, status };
    }

    // 5xx / other
    return { profile: undefined, status };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[fetchMyProfileServer] fetch error", err);
    }

    return { profile: undefined, status: 0 };
  }
}

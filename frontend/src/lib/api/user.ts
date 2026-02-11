// ==============================
// frontend/lib/api/user.ts
// Hardened for CSR / SSR (Production-safe)
// ==============================

import axios, { AxiosInstance, AxiosError } from "axios";
import type { UpdateUserPayload } from "@/types/user-profile";
import { api, apiPost, apiPatch } from "./api";
import type { PublicUserSearch } from "@/types/user-search";
import { UserProfile,PublicUserProfile } from "@/types/user-profile";

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


// ==============================
// CSR axios client
// ==============================
const apiClient: AxiosInstance = axios.create({
  baseURL: PUBLIC_API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  config.withCredentials = true;
  return config;
});

// ==============================
// UPDATE PROFILE
// ==============================

export async function updateUserProfile(
  payload: UpdateUserPayload
): Promise<UserProfile> {
  const res = await api.put("/users/update", payload);
  return res.data;
}

// ==============================
// CSR — My Profile
// ==============================

export async function fetchMyProfileClient(): Promise<
  UserProfile | null | undefined
> {
  try {
    const response = await apiClient.get("/users/me");
    const data = response.data;

    if (data && typeof data === "object" && data.data) {
      return data.data;
    }

    if (data && typeof data === "object" && data.id) {
      return data;
    }

    return undefined;
  } catch (err) {
    const error = err as AxiosError;

    if (error.response?.status === 401) {
      return null;
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn("[fetchMyProfileClient] transient error", error);
    }

    return undefined;
  }
}

// ==============================
// SSR — My Profile (IMPORTANT FIX)
// ==============================

export async function fetchMyProfileServer(
  cookieHeader: string | undefined
): Promise<{
  profile: UserProfile | null | undefined;
  status: number;
}> {
  const baseUrl = normalizeBaseUrl(
    process.env.INTERNAL_BACKEND_URL || PUBLIC_API_BASE_URL
  );

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

    if (status === 401) {
      return { profile: null, status };
    }

    if (status >= 200 && status < 300) {
      const json = await response.json().catch(() => null);

      if (!json) {
        return { profile: undefined, status };
      }

      if (json.data && typeof json.data === "object") {
        return { profile: json.data, status };
      }

      if (json.id) {
        return { profile: json, status };
      }

      return { profile: undefined, status };
    }

    return { profile: undefined, status };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[fetchMyProfileServer] fetch error", err);
    }

    return { profile: undefined, status: 0 };
  }
}

// ==============================
// CSR — Public Profile
// ==============================

export async function fetchPublicUserProfileClient(
  userId: string
): Promise<PublicUserProfile | null> {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    const data = response.data;

    if (data && typeof data === "object" && data.id) {
      return data as PublicUserProfile;
    }

    return null;
  } catch (err) {
    const error = err as AxiosError;

    if (error.response?.status === 404) {
      return null;
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[fetchPublicUserProfileClient] error",
        error.response?.status
      );
    }

    return null;
  }
}

// ==============================
// SSR — Public Profile
// ==============================

export async function fetchPublicUserProfileServer(
  userId: string,
  cookieHeader?: string
): Promise<{
  profile: PublicUserProfile | null;
  status: number;
}> {
  const baseUrl = normalizeBaseUrl(
    process.env.INTERNAL_BACKEND_URL || PUBLIC_API_BASE_URL
  );

  try {
    const response = await fetch(`${baseUrl}/users/${userId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      credentials: "include",
      cache: "no-store",
    });

    const status = response.status;

    if (status === 404) {
      return { profile: null, status };
    }

    if (status >= 200 && status < 300) {
      const json = await response.json().catch(() => null);

      if (json && json.id) {
        return { profile: json as PublicUserProfile, status };
      }

      return { profile: null, status };
    }

    return { profile: null, status };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[fetchPublicUserProfileServer] error", err);
    }

    return { profile: null, status: 0 };
  }

}

export async function searchUsers(params: {
  query: string;
  limit?: number;
}): Promise<PublicUserSearch[]> {
  const { query, limit = 10 } = params;

  const res = await api.get<PublicUserSearch[]>("/users/search", {
    params: {
      query,
      limit,
    },
    withCredentials: true,
  });

  return res.data;
}


/**
 * POST /users/:id/block
 * Backend authority
 */
export async function blockUser(
  userId: string,
): Promise<void> {
  await apiPost<void>(`/users/${userId}/block`);
}

/**
 * DELETE /users/:id/block
 * Backend authority
 */
export async function unblockUser(
  userId: string,
): Promise<void> {
  await api.delete(`/users/${userId}/block`, {
    withCredentials: true,
  });
}

/**
 * ==============================
 * GET /users/me/blocks
 * CSR
 * ==============================
 */
export async function getMyBlockedUsersClient(params?: {
  cursor?: string | null;
  limit?: number;
}): Promise<{
  items: Array<{
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    blockedAt: string;
  }>;
  nextCursor: string | null;
}> {
  const res = await api.get("/users/me/blocks", {
    params: {
      cursor: params?.cursor ?? undefined,
      limit: params?.limit ?? undefined,
    },
    withCredentials: true,
  });

  return res.data;
}

/**
 * ==============================
 * GET /users/me/blocks
 * SSR
 * ==============================
 */
export async function getMyBlockedUsersServer(
  cookieHeader?: string,
  params?: { cursor?: string | null; limit?: number },
): Promise<{
  items: Array<{
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    blockedAt: string;
  }>;
  nextCursor: string | null;
}> {
  const baseUrl = normalizeBaseUrl(
    process.env.INTERNAL_BACKEND_URL || PUBLIC_API_BASE_URL
  );

  const url = new URL(`${baseUrl}/users/me/blocks`);
  if (params?.cursor) url.searchParams.set("cursor", params.cursor);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    return { items: [], nextCursor: null };
  }

  const json = await res.json().catch(() => null);
  if (!json || !Array.isArray(json.items)) {
    return { items: [], nextCursor: null };
  }

  return json;
}

export type VerifyCredentialScope =
  | "ACCOUNT_LOCK"
  | "PROFILE_EXPORT";

export async function verifyCredential(
  input:
    | string
    | { password: string; scope: VerifyCredentialScope },
): Promise<{ success: true }> {
  const payload =
    typeof input === "string"
      ? { password: input }
      : input;

  return apiPost("/users/me/verify-credential", payload);
}


export async function updateMyUsername(username: string): Promise<{
  success: true;
  username: string;
}> {
  return apiPatch("/users/me/username", { username });
}

export async function requestEmailChange(
  newEmail: string,
): Promise<{ success: true }> {
  return apiPost("/users/me/email/change-request", {
    newEmail,
  });
}

export async function confirmEmailChange(
  token: string,
): Promise<{ success: true }> {
  return apiPost("/users/email/confirm", { token });
}


export async function requestPhoneChange(params: {
  phone: string;
  countryCode: string;
}): Promise<{ success: true }> {
  return apiPost("/users/me/phone/change-request", params);
}

export async function confirmPhoneChange(
  token: string,
): Promise<{ success: true }> {
  return apiPost("/users/me/phone/confirm", {
    token,
  });
}

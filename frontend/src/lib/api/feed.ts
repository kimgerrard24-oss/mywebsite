// frontend/src/lib/api/feed.ts

import axios, { AxiosInstance, AxiosError } from "axios";
import { api } from "./api";
import type { FeedResponse } from "@/types/post-feed";

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
// CSR — Feed
// ==============================
export async function fetchFeedClient(params?: {
  cursor?: string | null;
  limit?: number;
  mediaType?: "video";
}): Promise<FeedResponse | null> {
  try {
    const res = await apiClient.get("feed", {
      params: {
        cursor: params?.cursor ?? undefined,
        limit: params?.limit ?? undefined,
        mediaType: params?.mediaType ?? undefined,
      },
    });

    return res.data as FeedResponse;
  } catch (err) {
    const error = err as AxiosError;

    if (process.env.NODE_ENV !== "production") {
      console.warn("[fetchFeedClient] error", error.response?.status);
    }

    return null;
  }
}

// ==============================
// SSR — Feed
// ==============================
export async function fetchFeedServer(params: {
  cookieHeader?: string;
  cursor?: string | null;
  limit?: number;
  mediaType?: "video";
}): Promise<FeedResponse> {
  const baseUrl = normalizeBaseUrl(
    process.env.INTERNAL_BACKEND_URL || PUBLIC_API_BASE_URL
  );

  const url = new URL(`${baseUrl}/feed`);
  if (params.cursor) url.searchParams.set("cursor", params.cursor);
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  if (params.mediaType) url.searchParams.set("mediaType", params.mediaType);

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(params.cookieHeader ? { Cookie: params.cookieHeader } : {}),
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

    return json as FeedResponse;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[fetchFeedServer] fetch error", err);
    }

    return { items: [], nextCursor: null };
  }
}

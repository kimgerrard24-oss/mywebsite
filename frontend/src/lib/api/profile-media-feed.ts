// frontend/src/lib/api/profile-media-feed.ts

import { api } from "./api";
import type { ProfileMediaFeedResponse } from "@/types/profile-media-feed";

export async function getUserProfileMedia(params: {
  userId: string;
  cursor?: string | null;
  limit?: number;
  type?: "AVATAR" | "COVER";
}): Promise<ProfileMediaFeedResponse> {
  const { userId, cursor, limit, type } = params;

  const search = new URLSearchParams();

  if (cursor) search.set("cursor", cursor);
  if (limit) search.set("limit", String(limit));
  if (type) search.set("type", type);

  const queryString = search.toString();
  const url = queryString
    ? `/users/${userId}/profile-media?${queryString}`
    : `/users/${userId}/profile-media`;

  try {
    const res = await api.get<ProfileMediaFeedResponse>(url, {
      withCredentials: true,
    });

    return res.data;
  } catch (err: any) {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      "โหลดรูปไม่สำเร็จ";

    throw new Error(
      Array.isArray(message) ? message.join(", ") : message
    );
  }
}


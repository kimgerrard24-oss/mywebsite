// frontend/src/lib/api/profile-media-current.ts

import { api } from "./api";
import type { GetCurrentProfileMediaResponse } from "@/types/profile-media-current";

export async function getCurrentProfileMedia(
  userId: string,
): Promise<GetCurrentProfileMediaResponse> {
  const res = await api.get<GetCurrentProfileMediaResponse>(
    `/users/${encodeURIComponent(userId)}/profile-media/current`,
    { withCredentials: true },
  );

  return res.data;
}

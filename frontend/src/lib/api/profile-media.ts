// frontend/src/lib/api/profile-media.ts

import { api } from "./api";
import type {
  SetAvatarResponse,
  SetCoverResponse,
  DeleteProfileMediaResponse,
} from "@/types/profile-media";

export async function setAvatar(
  mediaId: string,
): Promise<SetAvatarResponse> {
  const res = await api.patch<SetAvatarResponse>(
    "/users/me/avatar",
    { mediaId },
    { withCredentials: true },
  );

  return res.data;
}

export async function setCover(
  mediaId: string,
): Promise<SetCoverResponse> {
  const res = await api.patch<SetCoverResponse>(
    "/users/me/cover",
    { mediaId },
    { withCredentials: true },
  );

  return res.data;
}

export async function deleteProfileMedia(
  mediaId: string,
): Promise<DeleteProfileMediaResponse> {
  const res = await api.delete<DeleteProfileMediaResponse>(
    `/users/me/profile-media/${mediaId}`,
    { withCredentials: true },
  );

  return res.data;
}
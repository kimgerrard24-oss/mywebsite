// frontend/src/lib/api/profile-media-set-current.ts

import { api } from "./api";
import type {
  SetCurrentProfileMediaRequest,
  SetCurrentProfileMediaResponse,
} from "@/types/set-current-profile-media";

export async function setCurrentProfileMedia(
  mediaId: string,
  payload: SetCurrentProfileMediaRequest,
): Promise<SetCurrentProfileMediaResponse> {
  const res = await api.post<SetCurrentProfileMediaResponse>(
    `/users/me/profile-media/${mediaId}/set-current`,
    payload,
    { withCredentials: true },
  );

  return res.data;
}

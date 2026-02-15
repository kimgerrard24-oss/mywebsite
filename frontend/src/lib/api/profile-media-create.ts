// frontend/src/lib/api/profile-media-create.ts

import { api } from "./api";

export async function createProfileMedia(data: {
  objectKey: string;
  type: "AVATAR" | "COVER";
  caption?: string | null;
  setAsCurrent?: boolean;
}) {
  const res = await api.post(
    "/users/me/profile-media",
    data,
    { withCredentials: true }
  );

  return res.data;
}


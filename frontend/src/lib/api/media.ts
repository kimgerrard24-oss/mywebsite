//  frontend/src/lib/api/media.ts
import { api } from "./api";

// ==============================
// Types (ตรงกับ backend 100%)
// ==============================

export type PresignValidateRequest = {
  fileName: string;
  fileSize: number;
  mimeType: string;
  mediaType: "image" | "video";
};

export type PresignValidateResponse = {
  uploadUrl: string;
  objectKey: string;
  expiresIn: number;
};

// ==============================
// API
// ==============================

export async function requestPresignValidate(
  payload: PresignValidateRequest,
): Promise<PresignValidateResponse> {
  const res = await api.post<PresignValidateResponse>(
    "/media/presign/validate",
    payload,
    {
      withCredentials: true, // cookie-based auth (production)
    },
  );

  return res.data;
}

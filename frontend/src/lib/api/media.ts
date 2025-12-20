// frontend/src/lib/api/media.ts
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
// Helpers (SAFE / Production)
// ==============================

/**
 * Build presign payload from File
 * Ensures payload always matches backend DTO
 */
export function buildPresignValidatePayload(
  file: File,
): PresignValidateRequest {
  if (!file?.name || !file.type || typeof file.size !== "number") {
    throw new Error("Invalid file for presign validation");
  }

  const mediaType: "image" | "video" =
    file.type.startsWith("video/")
      ? "video"
      : "image";

  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    mediaType,
  };
}

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

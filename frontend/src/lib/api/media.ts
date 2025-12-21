// frontend/src/lib/api/media.ts
import { api } from "./api";
import type { IncomingMessage } from 'http';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  'https://api.phlyphant.com';

export type MediaMetadataResponse = {
  id: string;
  type: 'image' | 'video';
  url: string;
  objectKey: string;
  ownerUserId: string;
  postId: string | null;
  createdAt: string;
  isOwner: boolean;
};


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


export async function getMediaById(
  mediaId: string,
  options?: { req?: IncomingMessage },
): Promise<MediaMetadataResponse> {
  const res = await fetch(
    `${API_BASE}/media/${encodeURIComponent(mediaId)}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(options?.req?.headers.cookie
          ? { cookie: options.req.headers.cookie }
          : {}),
      },
      credentials: 'include',
    },
  );

  if (!res.ok) {
    throw new Error('Failed to fetch media metadata');
  }

  return res.json();
}
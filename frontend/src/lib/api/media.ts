// frontend/src/lib/api/media.ts
import { api } from "./api";
import type { IncomingMessage } from 'http';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  'https://api.phlyphant.com';

export type MediaMetadataResponse = {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  objectKey: string;

  /**
   * 🔹 NEW
   * - CDN URL ของ video thumbnail
   * - undefined สำหรับ image / audio
   */
  thumbnailUrl?: string;

  ownerUserId: string;
  postId: string | null;
  createdAt: string;
  isOwner: boolean;
  canAppeal?: boolean;

   usedPost?: {
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      username: string;
      avatarUrl: string | null;
    };
  };
};



export type PresignValidateRequest = {
  fileName: string;
  fileSize: number;
  mimeType: string;
  mediaType: "image" | "video" | "audio";
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

  let mediaType: "image" | "video" | "audio";

  if (file.type.startsWith("image/")) {
    mediaType = "image";
  } else if (file.type.startsWith("video/")) {
    mediaType = "video";
  } else if (file.type.startsWith("audio/")) {
    mediaType = "audio";
  } else {
    throw new Error("Unsupported media type");
  }

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


/* =========================================================
 * Get media metadata (viewer)
 * ========================================================= */

export async function getMediaById(
  mediaId: string,
  options?: {
    /**
     * For SSR only (pass ctx.req)
     */
    req?: IncomingMessage;
  },
): Promise<MediaMetadataResponse> {
  if (!mediaId) {
    throw new Error("mediaId is required");
  }

  const res = await fetch(
    `${API_BASE}/media/${encodeURIComponent(mediaId)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",

        // SSR cookie forwarding
        ...(options?.req?.headers.cookie
          ? { cookie: options.req.headers.cookie }
          : {}),
      },
      credentials: "include",
    },
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch media metadata (${res.status})`,
    );
  }

  return (await res.json()) as MediaMetadataResponse;
}


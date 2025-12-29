// frontend/src/lib/api/media-complete.ts
import axios from "axios";

const rawBase =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_BASE ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://api.phlyphant.com";

const API_BASE = rawBase.replace(/\/+$/, "");

export type MediaCompleteRequest = {
  objectKey: string;
  mediaType: "image" | "video" | "audio";
  mimeType: string;
};

export type MediaCompleteResponse = {
  mediaId: string;
};

export async function completeMediaUpload(
  payload: MediaCompleteRequest
): Promise<MediaCompleteResponse> {
  const res = await axios.post<MediaCompleteResponse>(
    `${API_BASE}/media/complete`,
    payload,
    {
      withCredentials: true, // Cookie-based auth
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
}

// frontend/src/lib/api/my-media.ts

import type { IncomingMessage } from "http";
import type { MyMediaGalleryResponse } from "@/types/my-media";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://api.phlyphant.com";

export async function getMyMediaGallery(
  params: {
    cursor?: string;
    limit?: number;
    type?: "all" | "image" | "video";

    usedOnly?: boolean;
  },
  options?: { req?: IncomingMessage },
): Promise<MyMediaGalleryResponse> {
  const qs = new URLSearchParams();

  if (params.usedOnly === true) {
    qs.set("usedOnly", "true");
  }

  if (params.cursor) qs.set("cursor", params.cursor);
  if (params.limit)
    qs.set("limit", String(params.limit));
  if (params.type) qs.set("type", params.type);

  const res = await fetch(
    `${API_BASE}/media/me/gallery?${qs.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(options?.req?.headers.cookie
          ? { cookie: options.req.headers.cookie }
          : {}),
      },
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(
      "Failed to fetch my media gallery",
    );
  }

  return res.json();
}

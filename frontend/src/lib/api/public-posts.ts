// frontend/src/lib/api/public-posts.ts

import type { GetServerSidePropsContext } from "next";
import type { PublicPostDetail } from "@/types/public-post-detail";

const API_BASE =
  process.env.INTERNAL_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://api.phlyphant.com";

export async function getPublicPostById(
  postId: string,
  ctx?: GetServerSidePropsContext,
): Promise<PublicPostDetail | null> {
  try {
    const res = await fetch(
      `${API_BASE.replace(/\/+$/, "")}/p/${postId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(ctx?.req?.headers.cookie
            ? { Cookie: ctx.req.headers.cookie }
            : {}),
        },
        credentials: "include",
        cache: "no-store",
      },
    );

    if (!res.ok) return null;

    return (await res.json()) as PublicPostDetail;
  } catch {
    return null;
  }
}

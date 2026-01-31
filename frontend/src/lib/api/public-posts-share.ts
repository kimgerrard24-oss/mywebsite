// frontend/lib/api/public-posts-share.ts

import type { GetServerSidePropsContext } from "next";
import type { PublicPostShare } from "@/types/public-post-share";
import { apiPath } from "./api";

/**
 * =================================================
 * Get Public Post (External Share / OG / Crawler)
 * =================================================
 * - NEVER throws
 * - SSR safe
 * - External-safe
 */
export async function getPublicPostShareById(
  postId: string,
  ctx?: GetServerSidePropsContext,
): Promise<PublicPostShare | null> {
  const url = apiPath(
    `/public/posts/${encodeURIComponent(postId)}/share`,
  );

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(ctx?.req?.headers["user-agent"]
          ? {
              "User-Agent":
                ctx.req.headers["user-agent"] as string,
            }
          : {}),
      },
      credentials: "omit",
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as PublicPostShare;
  } catch {
    return null;
  }
}

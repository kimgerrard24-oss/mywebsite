// frontend/lib/api/public-posts-share.ts

import type { GetServerSidePropsContext } from "next";
import type { PublicPostShare } from "@/types/public-post-share";
import { apiPath } from "./api";

/**
 * =================================================
 * Get Public Post (External Share / OG / Crawler)
 * =================================================
 * GET /public/posts/:postId/share
 *
 *  No auth
 *  No cookie
 *  No credentials
 *  Backend is authority
 */
export async function getPublicPostShareById(
  postId: string,
  ctx?: GetServerSidePropsContext,
): Promise<PublicPostShare | null> {
  try {
    const url = apiPath(
      `/public/posts/${encodeURIComponent(postId)}/share`,
    );

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",

        // ส่ง UA เพื่อให้ backend / CDN / log ใช้ได้ (optional)
        ...(ctx?.req?.headers["user-agent"]
          ? {
              "User-Agent":
                ctx.req.headers["user-agent"] as string,
            }
          : {}),
      },

      // 🔒 สำคัญมาก: external share ต้องไม่พก credential ใด ๆ
      credentials: "omit",

      // 🔒 OG / crawler ต้องได้ข้อมูลสด
      cache: "no-store",
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      const err: any = new Error(
        `HTTP ${res.status} when fetching public post share`,
      );
      err.status = res.status;
      throw err;
    }

    return (await res.json()) as PublicPostShare;
  } catch {
    // external share: soft fail เท่านั้น
    return null;
  }
}

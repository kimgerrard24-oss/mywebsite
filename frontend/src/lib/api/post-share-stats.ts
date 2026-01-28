// frontend/src/lib/api/post-share-stats.ts

import { api } from "./api";
import type { GetServerSidePropsContext } from "next";

export type PostShareStats = {
  postId: string;
  internalShareCount: number;
  externalShareCount: number;
  updatedAt: string;
};

export async function getPostShareStats(
  postId: string,
  ctx?: GetServerSidePropsContext,
): Promise<PostShareStats | null> {
  try {
    const res = await api.get<PostShareStats>(
      `/posts/${postId}/share-stats`,
      ctx
        ? {
            headers: {
              cookie: ctx.req.headers.cookie || "",
            },
            withCredentials: true,
          }
        : {
            withCredentials: true,
          },
    );

    return res.data;
  } catch {
    // fail-soft → UI ตัดสินใจเองว่าจะโชว์หรือไม่
    return null;
  }
}

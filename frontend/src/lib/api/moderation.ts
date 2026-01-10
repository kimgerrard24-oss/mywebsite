// frontend/src/lib/api/moderation.ts
import type { GetServerSidePropsContext } from "next";

import { apiPath,client } from '@/lib/api/api';
import type { 
  ModeratedCommentDetail,
  ModeratedPostDetail,
  ModeratedMessageDetail,
 } from '@/types/moderation';

 type ModeratedMessageResponse = {
  message: ModeratedMessageDetail;
  moderation: {
    actionType: string;
    reason?: string | null;
    createdAt: string;
  };
  canAppeal: boolean;
};


/**
 * SSR-safe fetch (uses Cookie header)
 */
export async function getMyModeratedPostSSR(
  postId: string,
  ctx: GetServerSidePropsContext,
): Promise<ModeratedPostDetail> {
  const base =
    process.env.INTERNAL_BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "https://api.phlyphant.com";

  const cookieHeader =
    ctx.req.headers.cookie ?? "";

  const res = await fetch(
    `${base}/moderation/me/posts/${postId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(cookieHeader
          ? { Cookie: cookieHeader }
          : {}),
      },
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * CSR fetch (HttpOnly cookie)
 */
export async function getMyModeratedPostClient(
  postId: string,
): Promise<ModeratedPostDetail> {
  const res = await fetch(
    apiPath(`/moderation/me/posts/${postId}`),
    {
      credentials: 'include',
    },
  );

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

export async function getMyModeratedCommentSSR(
  commentId: string,
  ctx: GetServerSidePropsContext,
) {
  const cookie =
    ctx.req.headers.cookie ?? "";

  const base =
    process.env.INTERNAL_BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "https://api.phlyphant.com";

  const res = await fetch(
    `${base}/moderation/me/comments/${commentId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} fetching moderated comment`,
    );
  }

  return res.json();
}

/* ================= CSR ================= */

export async function getMyModeratedCommentClient(
  commentId: string,
): Promise<ModeratedCommentDetail> {
  const res = await fetch(
    apiPath(`/moderation/me/comments/${commentId}`),
    {
      credentials: 'include',
    },
  );

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

export async function getMyModeratedMessageSSR(
  messageId: string,
  ctx: GetServerSidePropsContext,
) {
  const cookie =
    ctx.req.headers.cookie ?? "";

  const base =
    process.env.INTERNAL_BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "https://api.phlyphant.com";

  const res = await fetch(
    `${base}/moderation/me/messages/${messageId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} fetching moderated message`,
    );
  }

  return res.json();
}

export async function getMyModeratedMessageClient(
  messageId: string,
): Promise<ModeratedMessageResponse> {
  const res = await fetch(
    apiPath(`/moderation/me/messages/${messageId}`),
    {
      credentials: "include",
    },
  );

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

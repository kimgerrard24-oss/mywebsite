// frontend/src/lib/api/share-links.ts

import type { GetServerSidePropsContext } from "next";

const API_BASE =
  process.env.INTERNAL_BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "https://api.phlyphant.com";

export type ShareLinkResolveResult = {
  postId: string;
  redirectUrl: string;
};

export async function resolveShareLinkSSR(
  code: string,
  ctx: GetServerSidePropsContext,
): Promise<ShareLinkResolveResult | null> {
  const url = `${API_BASE.replace(
    /\/+$/,
    "",
  )}/s/${encodeURIComponent(code)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(ctx.req.headers.cookie
        ? { Cookie: ctx.req.headers.cookie }
        : {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const err: any = new Error(
      "Failed to resolve share link",
    );
    (err.response = { status: res.status }),
      err;
    throw err;
  }

  return (await res.json()) as ShareLinkResolveResult;
}

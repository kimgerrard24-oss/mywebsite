// frontend/src/lib/api/share-links.client.ts

import { api } from "./api";

export type ShareLinkResolveResult = {
  postId: string;
  redirectUrl: string;
};

export async function resolveShareLink(
  code: string,
): Promise<ShareLinkResolveResult> {
  const res = await api.get<ShareLinkResolveResult>(
    `/s/${encodeURIComponent(code)}`,
    { withCredentials: true },
  );

  return res.data;
}

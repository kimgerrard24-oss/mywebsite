// frontend/src/components/posts/PostTagList.tsx

"use client";

import { useState, useEffect } from "react";
import { PostUserTagItem } from "@/types/post-user-tag";
import { useUpdatePostTag } from "@/hooks/useUpdatePostTag";

type Props = {
  postId: string;
  tags: PostUserTagItem[];
};

export default function PostTagList({ postId, tags }: Props) {
  const { submit, loading } = useUpdatePostTag();
  const [local, setLocal] = useState(tags);
  useEffect(() => {
    setLocal(tags);
  }, [tags]);

  async function act(
    tagId: string,
    action: "ACCEPT" | "REJECT" | "REMOVE",
  ) {
    try {
      const res = await submit({ postId, tagId, action });

      setLocal((prev) =>
        prev.map((t) =>
          t.id === tagId ? { ...t, status: res.status } : t,
        ),
      );
    } catch {
      // fail-soft
    }
  }

  return (
    <section aria-label="Tagged people" className="mt-3">
      <h3 className="text-sm font-semibold mb-2">
        Tagged people
      </h3>

      <ul className="flex flex-col gap-2">
        {local.map((t) => {
          const canAcceptReject =
            t.isTaggedUser && t.status === "PENDING";

         const canRemove =
  (t.isTaggedUser || t.isPostOwner) &&
  t.status === "ACCEPTED";


          return (
            <li
              key={t.id}
              className="flex items-center gap-3 rounded-lg border px-3 py-2"
            >
              <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                {t.taggedUser.avatarUrl && (
                  <img
                    src={t.taggedUser.avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="flex flex-col text-sm">
                <span className="font-medium">
                  {t.taggedUser.displayName ||
                    t.taggedUser.username}
                </span>
                <span className="text-xs text-gray-500">
                  @{t.taggedUser.username}
                </span>
              </div>

              <span className="ml-auto text-xs text-gray-500">
                {t.status}
              </span>

              {canAcceptReject && (
                <div className="flex gap-1">
                  <button
                    disabled={loading}
                    onClick={() => act(t.id, "ACCEPT")}
                    className="text-xs px-2 py-1 rounded bg-blue-600 text-white"
                  >
                    Accept
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => act(t.id, "REJECT")}
                    className="text-xs px-2 py-1 rounded border"
                  >
                    Reject
                  </button>
                </div>
              )}

              {canRemove && (
                <button
                  disabled={loading}
                  onClick={() => act(t.id, "REMOVE")}
                  className="text-xs px-2 py-1 rounded border text-red-600"
                >
                  Remove
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

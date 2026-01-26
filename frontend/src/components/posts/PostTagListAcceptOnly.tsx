// frontend/src/components/posts/PostTagListAcceptOnly.tsx

"use client";

import { useState } from "react";
import type { PostUserTagItem } from "@/types/post-user-tag";
import PostAcceptTagButton from "./PostAcceptTagButton";

type Props = {
  postId: string;
  tags: PostUserTagItem[];
};

export default function PostTagListAcceptOnly({
  postId,
  tags,
}: Props) {
  const [local, setLocal] = useState(tags);

  return (
    <section aria-label="Tagged people" className="mt-3">
      <h3 className="text-sm font-semibold mb-2">
        Tagged people
      </h3>

      <ul className="flex flex-col gap-2">
        {local.map((t) => {
          const canAccept =
            t.isTaggedUser && t.status === "PENDING";

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

              {canAccept && (
                <PostAcceptTagButton
                  postId={postId}
                  tagId={t.id}
                  onAccepted={() => {
                    setLocal((prev) =>
                      prev.map((x) =>
                        x.id === t.id
                          ? { ...x, status: "ACCEPTED" }
                          : x,
                      ),
                    );
                  }}
                />
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

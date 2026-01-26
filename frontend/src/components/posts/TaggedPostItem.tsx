// frontend/src/components/posts/TaggedPostItem.tsx

"use client";

import Link from "next/link";
import { useState } from "react";
import type { MyTaggedPostItem } from "@/types/tagged-posts";
import { useUpdatePostTag } from "@/hooks/useUpdatePostTag";
import { toast } from "react-hot-toast";

type Props = {
  post: MyTaggedPostItem;
  onRemoved?: () => void; // ✅ notify parent
};

export default function TaggedPostItem({
  post,
  onRemoved,
}: Props) {
  const { submit, loading } = useUpdatePostTag();

  // normally only 1 tag in this feed (viewer only), but keep array-safe
  const [userTags, setUserTags] = useState(post.userTags);

  const tag = userTags[0];

  async function act(
    tagId: string,
    action: "ACCEPT" | "REJECT" | "REMOVE",
  ) {
    if (!tag) return;

    const prevTags = userTags;

    // =============================
    // Optimistic update
    // =============================
    if (action === "ACCEPT") {
      setUserTags((prev) =>
        prev.map((t) =>
          t.id === tagId
            ? { ...t, status: "ACCEPTED" }
            : t,
        ),
      );
    }

    try {
      const res = await submit({
        postId: post.id,
        tagId,
        action,
      });

      // =============================
      // Success feedback + list sync
      // =============================
      if (res?.status === "ACCEPTED") {
        toast.success("Tag accepted");
      } else if (res?.status === "REJECTED") {
        toast.success("Tag rejected");
        onRemoved?.(); // ✅ remove from list
      } else {
        toast.success("Tag removed");
        onRemoved?.(); // ✅ remove from list
      }
    } catch {
      // =============================
      // Rollback on error
      // =============================
      setUserTags(prevTags);
      toast.error("Action failed. Please try again.");
    }
  }

  const canAcceptReject =
    tag && tag.status === "PENDING";

  const canRemove =
    tag && tag.status === "ACCEPTED";

  return (
    <article className="p-4 space-y-2">
      {/* ================= Content ================= */}
      <p className="text-sm text-gray-800 break-words">
        {post.content}
      </p>

      {/* ================= Meta ================= */}
      <div className="flex items-center justify-between text-xs text-gray-500 gap-3">
        <time dateTime={post.createdAt}>
          {new Date(post.createdAt).toLocaleString()}
        </time>

        <Link
          href={`/posts/${post.id}`}
          className="text-blue-600 hover:underline"
        >
          View post
        </Link>
      </div>

      {/* ================= Tag Status + Actions ================= */}
      {tag && (
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <span className="text-xs text-gray-600">
            Tag status:
            <span className="ml-1 font-medium">
              {tag.status}
            </span>
          </span>

          {canAcceptReject && (
            <>
              <button
                disabled={loading}
                onClick={() => act(tag.id, "ACCEPT")}
                className="
                  text-xs
                  px-2
                  py-1
                  rounded
                  bg-blue-600
                  text-white
                  disabled:opacity-50
                "
              >
                Accept
              </button>

              <button
                disabled={loading}
                onClick={() => act(tag.id, "REJECT")}
                className="
                  text-xs
                  px-2
                  py-1
                  rounded
                  border
                  disabled:opacity-50
                "
              >
                Reject
              </button>
            </>
          )}

          {canRemove && (
            <button
              disabled={loading}
              onClick={() => act(tag.id, "REMOVE")}
              className="
                text-xs
                px-2
                py-1
                rounded
                border
                text-red-600
                disabled:opacity-50
              "
            >
              Remove tag
            </button>
          )}
        </div>
      )}
    </article>
  );
}

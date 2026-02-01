// frontend/src/components/hided-posts/HiddenTaggedPostItem.tsx
import Link from "next/link";
import type { PostFeedItem } from "@/types/post-feed";
import Avatar from "@/components/ui/Avatar";
import UnhideTaggedPostButton from "./UnhideTaggedPostButton";

type Props = {
  post: PostFeedItem;
  onUnhide: () => Promise<void>;
};

export default function HiddenTaggedPostItem({
  post,
  onUnhide,
}: Props) {
  return (
    <article className="rounded border bg-white p-3">
      <div className="flex items-start gap-3">
        <Avatar
          avatarUrl={post.author.avatarUrl}
          name={post.author.displayName}
          size={36}
        />

        <div className="flex-1">
          <Link
            href={`/posts/${post.id}`}
            className="text-sm font-medium hover:underline"
          >
            {post.author.displayName ?? "Unknown user"}
          </Link>

          <p className="mt-1 text-sm text-gray-700 line-clamp-2">
            {post.content}
          </p>

          <div className="mt-2 flex items-center justify-between">
            <time className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleString()}
            </time>

            <UnhideTaggedPostButton onClick={onUnhide} />
          </div>
        </div>
      </div>
    </article>
  );
}

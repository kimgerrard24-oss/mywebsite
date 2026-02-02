// frontend/src/components/posts/PostDetail.tsx
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import PostTagList from "@/components/posts/PostTagList";
import type { PostDetail as PostDetailType } from "@/types/post-detail";
import PostActionMenu from "@/components/posts/PostActionMenu";
import { renderContentWithHashtags } from "@/utils/renderContentWithHashtags";
import { usePostLike } from "@/hooks/usePostLike";
import PostLikeListModal from "@/components/posts/PostLikeListModal";
import ShareButton from "@/components/share/ShareButton";
import PostShareStats from "@/components/posts/PostShareStats";
import Avatar from "@/components/ui/Avatar";
import PostMediaGrid from "@/components/posts/PostMediaGrid";
import RepostButton from "@/components/repost/RepostButton";
import PostRepostsModal from "@/components/repost/PostRepostsModal";
import UndoRepostButton from "@/components/repost/UndoRepostButton";

type Props = {
  post: PostDetailType;
};

export default function PostDetail({ post }: Props) {
  const router = useRouter();

  const isBlocked =
  post.author?.isBlocked === true ||
  post.author?.hasBlockedViewer === true;
  const acceptedTags =
  post.userTags?.filter((t) => t.status === "ACCEPTED") ?? [];

  const {
    likeCount,
    likes,
    likesLoading,
    likesError,
    hasMoreLikes,
    loadLikes,
  } = usePostLike({
    postId: post.id,
    initialLiked: post.isLikedByViewer ?? false,
    initialLikeCount: post.likeCount ?? 0,
  });

  const [isLikeModalOpen, setIsLikeModalOpen] = useState(false);

const openLikes = () => {
  if (isBlocked) return;

  setIsLikeModalOpen(true);
  loadLikes({ reset: true }); // โหลดเฉพาะตอนเปิด
};

const [repostsOpen, setRepostsOpen] = useState(false);

const closeLikes = () => {
  setIsLikeModalOpen(false);
};



  return (
    <>
      {/* ================= Header ================= */}
      <header
        className="
          mb-3
          sm:mb-4
          flex
          items-start
          sm:items-center
          justify-between
          gap-2
          sm:gap-3
        "
      >
        {post.author && (
  isBlocked ? (
    <div
      className="
        flex
        items-center
        gap-2
        sm:gap-3
        min-w-0
        opacity-60
        cursor-not-allowed
      "
      aria-label="Blocked user"
    >
      <Avatar
  avatarUrl={post.author.avatarUrl}
  name={post.author.displayName}
  size={40} // ใกล้ sm:h-10 w-10
/>

      <span
        className="
          font-medium
          text-sm
          sm:text-base
          truncate
        "
      >
        {post.author.displayName}
      </span>
    </div>
  ) : (
    <Link
      href={`/users/${post.author.id}`}
      className="
        flex
        items-center
        gap-2
        sm:gap-3
        hover:underline
        min-w-0
      "
    >
      <Avatar
  avatarUrl={post.author.avatarUrl}
  name={post.author.displayName}
  size={40}
/>

      <span
        className="
          font-medium
          text-sm
          sm:text-base
          truncate
        "
      >
        {post.author.displayName}
      </span>
    </Link>
  )
)}

      
        <div
          className="
            flex
            items-center
            gap-1.5
            sm:gap-2
            flex-shrink-0
          "
        >
          <time
            dateTime={post.createdAt}
            className="
              text-xs
              sm:text-sm
              text-gray-500
              whitespace-nowrap
            "
          >
            {new Date(post.createdAt).toLocaleString()}
          </time>

          <PostActionMenu
  postId={post.id}
  canDelete={!isBlocked && post.canDelete}
  canEdit={!isBlocked && post.canDelete}
  canReport={!isBlocked && !post.canDelete}
  onDeleted={() => {
    setRepostsOpen(false)
    router.replace("/feed");
  }}
/>

        </div>
      </header>

      {/* ================= Content ================= */}
      <section
        className="
          prose
          prose-sm
          sm:prose-base
          max-w-none
          break-words
        "
        aria-label="Post content"
      >
        <p>{renderContentWithHashtags(post.content)}</p>
      </section>

      {/* ================= Tagged Users (Accepted only) ================= */}
{acceptedTags.length > 0 && (
  <p className="mt-1 text-xs sm:text-sm text-gray-600">
    <span>with – </span>
    {acceptedTags.map((t, i) => (
      <span key={t.id}>
        <Link
          href={`/users/${t.taggedUser.id}`}
          className="text-blue-600 hover:underline font-medium"
        >
          {t.taggedUser.displayName || t.taggedUser.username}
        </Link>
        {i < acceptedTags.length - 1 && ", "}
      </span>
    ))}
  </p>
)}


{/* ================= Media ================= */}
{Array.isArray(post.media) && post.media.length > 0 && (
  <PostMediaGrid media={post.media} />
)}

      
{post.userTags && post.userTags.length > 0 && (
  <PostTagList postId={post.id} tags={post.userTags} />
)}


      {/* ================= Likes ================= */}
<section
  className="
    mt-4
    sm:mt-5
    flex
    items-center
    justify-between
    gap-3
  "
  aria-label="Post actions"
>
  {/* 👍 Likes (left) */}
  <button
    type="button"
    onClick={openLikes}
    disabled={isBlocked}
    aria-disabled={isBlocked}
    className={isBlocked ? "opacity-60 cursor-not-allowed" : undefined}
  >
    {likeCount} likes
  </button>

 {/* 🔗 Share + Repost (right) */}
<div className="flex items-center gap-2">
  <div
    role="button"
    tabIndex={isBlocked ? -1 : 0}
    aria-disabled={isBlocked}
    onClick={() => {
      if (!isBlocked) setRepostsOpen(true);
    }}
    onKeyDown={(e) => {
      if (!isBlocked && e.key === "Enter") {
        setRepostsOpen(true);
      }
    }}
    className={isBlocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
  >
    <PostShareStats postId={post.id} />
  </div>

  {!isBlocked && (
    <>
     {post.hasReposted ? (
  <UndoRepostButton
    postId={post.id}
    repostCount={post.repostCount ?? 0}
  />
) : (
  <RepostButton postId={post.id} />
)}

      <ShareButton postId={post.id} />
    </>
  )}
</div>


</section>

      <PostLikeListModal
  open={isLikeModalOpen}
  onClose={closeLikes}
  likes={likes}
  loading={likesLoading}
  error={likesError}
  hasMore={hasMoreLikes}
  onLoadMore={() => loadLikes()}
/>

<PostRepostsModal
  postId={post.id}
  open={repostsOpen}
  onClose={() => setRepostsOpen(false)}
/>


    </>
  );
}

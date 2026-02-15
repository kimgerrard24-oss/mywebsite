// frontend/src/components/posts/PostDetail.tsx
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import type { PostDetail as PostDetailType } from "@/types/post-detail";
import PostActionMenu from "@/components/posts/PostActionMenu";
import { renderContentWithHashtags } from "@/utils/renderContentWithHashtags";
import { usePostLike } from "@/hooks/usePostLike";
import PostLikeListModal from "@/components/posts/PostLikeListModal";
import Avatar from "@/components/ui/Avatar";
import PostMediaGrid from "@/components/posts/PostMediaGrid";
import RepostComposerModal from "@/components/repost/RepostComposerModal";
import PostCard from "@/components/posts/PostCard";
import PostShareMenu from "@/components/posts/PostShareMenu";
import { getDisplayName } from "@/utils/getDisplayName";
import PostLikeButton from "@/components/posts/PostLikeButton";

type Props = {
  post: PostDetailType;
  embedded?: boolean;
};

export default function PostDetail({ post, embedded }: Props) {

  const router = useRouter();

  const isBlocked =
  post.author?.isBlocked === true ||
  post.author?.hasBlockedViewer === true;
  const acceptedTags =
  post.userTags?.filter((t) => t.status === "ACCEPTED") ?? [];
  
  const {
  liked,
  likeCount,
  loading: likeLoading,
  toggleLike,
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

const isRepost = post.isRepost;
const actor = isRepost && post.originalPost
  ? post.author // คนที่ repost = เจ้าของ post นี้
  : post.author;

const originalAuthor = post.originalPost?.author;

const hasCaption = post.content.trim().length > 0;
const originalPost = post.originalPost;
const originalMedia = originalPost?.media;
const [showRepostComposer, setShowRepostComposer] = useState(false);
const [repostTargetId, setRepostTargetId] = useState<string | null>(null);

const [hasReposted, setHasReposted] = useState(
  post.hasReposted ?? false,
);


const [repostsOpen, setRepostsOpen] = useState(false);

const closeLikes = () => {
  setIsLikeModalOpen(false);
};

  return (
     <article
      className={[
        "w-full rounded-lg sm:rounded-xl border border-gray-200 bg-white",
        embedded ? "p-3" : "p-3 sm:p-4 md:p-5",
      ].join(" ")}
    >
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
  href={`/users/${actor.id}`}
  className="flex items-center gap-2 sm:gap-3 hover:underline min-w-0"
>
  <Avatar
    avatarUrl={actor.avatarUrl}
    name={actor.displayName}
    size={40}
  />

  <span className="font-medium text-sm sm:text-base truncate">
    {getDisplayName(actor)}
  </span>
</Link>

  )
)}

{isRepost && originalAuthor && (
  <span className="block text-xs text-gray-500">
    แชร์โพสต์{" "}
    <Link
      href={`/users/${originalAuthor.id}`}
      className="hover:underline"
    >
      {getDisplayName(originalAuthor)}

    </Link>
  </span>
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
    postType={post.type}   
    mediaId={post.media?.[0]?.id} 
    canDelete={!isBlocked && post.canDelete}
    canEdit={!isBlocked && post.canDelete}
    canReport={!isBlocked && !post.canDelete}
    onDeleted={() => {
      setRepostsOpen(false);
      router.replace("/feed");
    }}
  />

        </div>
      </header>

      {/* ================= Content ================= */}
{(!isRepost || hasCaption) && (
  <section
    className="
      prose
      prose-sm
      sm:prose-base
      max-w-none
      break-words
    "
  >
    <p>{renderContentWithHashtags(post.content)}</p>
  </section>
)}

{/* ================= Original Post (REAL) ================= */}
{isRepost && originalPost && (
  <div className="mt-4">
    <PostCard
      postId={originalPost.id}
      embedded
    />
  </div>
)}

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
{!isRepost && post.media.length > 0 && (
  <PostMediaGrid media={post.media} />
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
  <div className="flex items-center gap-4">
  <div className={isBlocked ? "opacity-50 pointer-events-none" : ""}>
    <PostLikeButton
      liked={liked}
      likeCount={likeCount}
      loading={likeLoading}
      onClick={() => {
        if (isBlocked) return;
        toggleLike();
      }}
    />
  </div>

 <button
  type="button"
  onClick={openLikes}
  disabled={isBlocked}
  aria-disabled={isBlocked}
  aria-label="ดูรายชื่อคนที่กดถูกใจโพสต์นี้"
  className={[
    "inline-flex items-center gap-1.5 text-xs sm:text-sm",
    "text-gray-500 hover:text-gray-700",
    "transition-colors",
    isBlocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
  ].join(" ")}
>
  <span aria-hidden="true">👥</span>
  <span className="font-medium">{likeCount}</span>
</button>

</div>


 {/* 🔗 Share + Repost (right) */}
<div className="flex items-center gap-2">

  <PostShareMenu
    postId={post.id}
    originalPostId={post.originalPost?.id}
    hasReposted={hasReposted}
    isBlocked={isBlocked}
    onOpenRepostComposer={(repostTargetId) => {
      setShowRepostComposer(true);
      setRepostTargetId(repostTargetId);
    }}
  />
</div>



</section>

{showRepostComposer && repostTargetId && (
  <RepostComposerModal
    repostOfPost={post}
    repostTargetId={repostTargetId}
    onClose={() => setShowRepostComposer(false)}
    onPosted={() => {
      setShowRepostComposer(false);
      setHasReposted(true);
    }}
  />
)}


      <PostLikeListModal
  open={isLikeModalOpen}
  onClose={closeLikes}
  likes={likes}
  loading={likesLoading}
  error={likesError}
  hasMore={hasMoreLikes}
  onLoadMore={() => loadLikes()}
/>

    </>
</article>
  );
}

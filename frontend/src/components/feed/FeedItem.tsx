// frontend/src/components/feed/FeedItem.tsx
import Link from "next/link";
import type { PostFeedItem } from "@/types/post-feed";
import PostActionMenu from "@/components/posts/PostActionMenu";
import { renderContentWithHashtags } from "@/utils/renderContentWithHashtags";
import PostLikeButton from "@/components/posts/PostLikeButton";
import { usePostLike } from "@/hooks/usePostLike";
import { useEffect,useState } from "react";
import CommentComposer from "@/components/comments/CommentComposer";
import CommentList from "@/components/comments/CommentList";
import FollowActionButton from '@/components/follows/FollowActionButton';
import Avatar from "@/components/ui/Avatar";
import FollowController from "@/components/follows/FollowController";
import ShareButton from "@/components/share/ShareButton";
import PostShareStats from "@/components/posts/PostShareStats";
import PostMediaGrid from "@/components/posts/PostMediaGrid";

type Props = {
  post: PostFeedItem;
  onDeleted?: (postId: string) => void;
  onHideTaggedPost?: () => void;
  onUnhideTaggedPost?: () => void;
};

export default function FeedItem({ 
  post, 
  onDeleted,
  onHideTaggedPost,
  onUnhideTaggedPost, 
}: Props) {
  const profileHref = post.canDelete
    ? "/profile"
    : `/users/${post.author.id}`;

  const {
    liked,
    likeCount,
    loading: likeLoading,
    toggleLike,
  } = usePostLike({
    postId: post.id,
    initialLiked: post.isLikedByViewer ?? false,
    initialLikeCount: post.stats.likeCount,
  });
  
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentCount, setCommentCount] = useState(
  post.stats.commentCount
  );
  
  const [isFollowing, setIsFollowing] = useState(
  post.author.isFollowing
 );

 const [isFollowRequested, setIsFollowRequested] = useState(
  post.author.isFollowRequested
 );

  
  const isBlocked = post.author.isBlocked === true;

  
  useEffect(() => {
  setIsFollowing(post.author.isFollowing);
  setIsFollowRequested(post.author.isFollowRequested);
}, [post.author.isFollowing, post.author.isFollowRequested]);
  
const taggedUsers = post.taggedUsers ?? [];

  return (
    <article
      className="
        w-full
        rounded-lg
        sm:rounded-xl
        border
        border-gray-200
        bg-white
        p-3
        sm:p-4
        md:p-5
      "
      aria-labelledby={`post-${post.id}`}
    >
      {/* ================= Header ================= */}
      <header
        className="
          mb-2
          sm:mb-3
          flex
          items-start
          justify-between
          gap-2
        "
      >
        <div
          className="
            flex
            items-start
            gap-2
            sm:gap-3
            min-w-0
          "
        >
          {/* ===== Avatar (LINK) ===== */}
          <Link href={profileHref} className="flex-shrink-0">
  <Avatar
    avatarUrl={post.author.avatarUrl}
    name={post.author.displayName}
    size={36} // ใกล้ sm:h-9 w-9
    className="cursor-pointer"
  />
</Link>



          {/* ===== Name + Time ===== */}
          <div className="flex min-w-0 flex-col leading-tight">
            <Link
              href={profileHref}
              id={`post-${post.id}`}
              className="
                text-sm
                sm:text-[0.95rem]
                font-medium
                text-gray-900
                hover:underline
                truncate
              "
            >
              {post.author.displayName ?? "Unknown user"}
            </Link>

            <time
              dateTime={post.createdAt}
              className="
                mt-0.5
                text-xs
                text-gray-500
                whitespace-nowrap
              "
            >
              {new Date(post.createdAt).toLocaleString()}
            </time>
          </div>
        </div>

        {/* ขวา: Follow + PostAction */}
  <div className="flex items-center gap-2">
         {/* 💬 Chat */}
  {!post.isSelf && !isBlocked && (
  <Link
    href={`/chat/${post.author.id}`}
    className="text-xs text-blue-600 hover:underline"
  >
    💬 แชท
  </Link>
)}


    {/* Follow (render only) */}
 {!post.isSelf && !isBlocked && (
  isFollowing ? (
    <FollowController
      userId={post.author.id}
      isFollowing={isFollowing}
      isBlocked={isBlocked}
      onChange={(v) => {
        setIsFollowing(v);
        if (!v) setIsFollowRequested(false);
      }}
    />
  ) : (
    <FollowActionButton
      userId={post.author.id}
      isFollowing={false}
      isPrivate={post.author.isPrivate}
      isBlocked={isBlocked}
      isFollowRequested={isFollowRequested}
      onFollowed={() => {
        setIsFollowing(true);
        setIsFollowRequested(false);
      }}
      onRequested={() => {
        setIsFollowRequested(true);
      }}
    />
  )
)}


    <PostActionMenu
      postId={post.id}
      canDelete={post.canDelete}
      canEdit={post.canDelete}
      canReport={!post.canDelete}

      canHideTaggedPost={post.isTaggedUser === true}
      isTagHidden={post.isHiddenByTaggedUser === true}
      onHideTaggedPost={onHideTaggedPost}
      onUnhideTaggedPost={onUnhideTaggedPost}
      
      onDeleted={() => {
        onDeleted?.(post.id);
      }}
    />
  </div>
      </header>

      {/* ================= Content ================= */}
      <p
        className="
          whitespace-pre-wrap
          break-words
          text-sm
          sm:text-[0.95rem]
          text-gray-800
          leading-relaxed
        "
      >
        {renderContentWithHashtags(post.content)}
      </p>

      {/* ================= Tagged Users ================= */}
{taggedUsers.length > 0 && (
  <p className="mt-1 text-xs sm:text-sm text-gray-600">
    <span>with – </span>
    {taggedUsers.map((u, i) => (
      <span key={u.id}>
        <Link
          href={`/users/${u.id}`}
          className="text-blue-600 hover:underline font-medium"
        >
          {u.displayName || u.username}
        </Link>
        {i < taggedUsers.length - 1 && ", "}
      </span>
    ))}
  </p>
)}


      {/* ================= Media ================= */}
{Array.isArray(post.media) && post.media.length > 0 && (
  <PostMediaGrid media={post.media} />
)}


      {/* ================= Footer ================= */}
      <footer
  className="
    mt-3
    sm:mt-4
    flex
    items-center
    justify-between
    text-xs
    sm:text-sm
    text-gray-600
  "
>
  {/* ===== Left: Like + Comment ===== */}
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
      disabled={isBlocked}
      onClick={() => setShowCommentBox((v) => !v)}
      className={`hover:underline ${
        isBlocked ? "opacity-50 cursor-not-allowed" : ""
      }`}
      aria-disabled={isBlocked}
    >
      💬 {commentCount}
    </button>
  </div>

  {/* ===== Right: Share ===== */}
  <div className="flex items-center gap-2">
    <PostShareStats postId={post.id} />
    {!isBlocked && <ShareButton postId={post.id} />}

  </div>
</footer>


       {showCommentBox && !isBlocked && (
  <section
    className="mt-3 border-t pt-3"
    aria-label="Post comments"
  >
    <CommentComposer
      postId={post.id}
      onCreated={() => {
        // fail-soft update
        setCommentCount((c) => c + 1);

        setShowCommentBox(false);
      }}
    />
     {/* 2️⃣ รายการคอมเมนต์ (GET /posts/:id/comments) */}
    <CommentList
  postId={post.id}
  onDeleted={() => {
    setCommentCount((c) => Math.max(0, c - 1));
  }}
/>

  </section>
  )}

    </article>
  );
}

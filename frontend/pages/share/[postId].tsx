// frontend/pages/share/[postId].tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import { useEffect } from "react";

import PostPublicDetail from "@/components/posts/PostPublicDetail";
import { getPublicPostShareById } from "@/lib/api/public-posts-share";
import type { PublicPostShare } from "@/types/public-post-share";
import type { PublicPostDetail } from "@/types/public-post-detail";

type Props = {
  post: PublicPostDetail;
};

/**
 * =========================================
 * Map backend PublicPostShare → UI model
 * =========================================
 * Backend = authority
 * Frontend = presentation only
 */
function mapShareToPublicPostDetail(
  share: PublicPostShare,
): PublicPostDetail {
  return {
    id: share.id,
    content: share.content,
    createdAt: share.createdAt,

    author: {
      id: "public",
      displayName: share.author.displayName,
      avatarUrl: null,
    },

    media: share.media.map((m, index) => ({
      id: `public-${index}`,
      type: m.type,
      url: m.cdnUrl,
      cdnUrl: m.cdnUrl,
      width: m.width,
      height: m.height,
      duration: null,
    })),
  };
}

export default function PublicSharePage({ post }: Props) {
  const firstMedia = post.media?.[0];
  const mediaSrc = firstMedia?.cdnUrl ?? firstMedia?.url;

  const hasMedia = post.media.length > 0;

const ogImage = hasMedia
  ? firstMedia?.type === "image"
    ? mediaSrc
    : "https://www.phlyphant.com/og/default-text-post.png"
  : "https://www.phlyphant.com/og/default-text-post.png";

const ogVideo =
  hasMedia && firstMedia?.type === "video"
    ? mediaSrc
    : undefined;

const ogType = hasMedia ? "article" : "website";

  /**
   * Support deep-link comment anchors
   * (no business logic here)
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (!hash.startsWith("#comment-")) return;

    const targetId = hash.slice(1);
    let attempts = 0;

    const tryScroll = () => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (attempts++ < 10) {
        setTimeout(tryScroll, 150);
      }
    };

    tryScroll();
  }, []);

  return (
    <>
      <Head>
        <title>{post.content.slice(0, 60)} | PhlyPhant</title>

        <meta
          name="description"
          content={post.content.slice(0, 160)}
        />

        {/* Canonical: PUBLIC SHARE ONLY */}
        <link
          rel="canonical"
          href={`https://www.phlyphant.com/share/${post.id}`}
        />

        <meta property="og:type" content={ogType} />

        <meta
          property="og:title"
          content={post.content.slice(0, 60)}
        />
        <meta
          property="og:description"
          content={post.content.slice(0, 160)}
        />
        <meta
          property="og:url"
          content={`https://www.phlyphant.com/share/${post.id}`}
        />

        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />


        {ogVideo && (
          <>
            <meta property="og:video" content={ogVideo} />
            <meta property="og:video:type" content="video/mp4" />
          </>
        )}
      </Head>

      <main
        className="mx-auto w-full max-w-sm sm:max-w-md md:max-w-2xl px-4 sm:px-6 py-6 sm:py-8"
        aria-label="Public shared post"
      >
        <article aria-label="Shared post content">
          <PostPublicDetail post={post} />
        </article>
      </main>
    </>
  );
}

/* ================= SSR ================= */

export const getServerSideProps: GetServerSideProps<Props> =
  async (ctx) => {
    const postId = ctx.params?.postId;
    if (typeof postId !== "string") {
      return { notFound: true };
    }

    /**
     * PUBLIC SHARE ONLY
     * - No auth
     * - No fallback
     * - Backend decides visibility
     */
    const share = await getPublicPostShareById(postId, ctx);

    if (!share) {
      return { notFound: true };
    }

    return {
      props: {
        post: mapShareToPublicPostDetail(share),
      },
    };
  };

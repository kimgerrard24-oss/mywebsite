// frontend/pages/posts/[postId].tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState, useEffect} from "react";

import PostDetail from "@/components/posts/PostDetail";
import CommentComposer from "@/components/comments/CommentComposer";
import CommentList from "@/components/comments/CommentList";

import { getPostById } from "@/lib/api/posts";
import { requireSessionSSR } from "@/lib/auth/require-session-ssr";
import type { PostDetail as PostDetailType } from "@/types/post-detail";

type Props = {
  post: PostDetailType;
};

export default function PostDetailPage({ post }: Props) {
  const router = useRouter();

  // ==============================
  // 🆕 Comment state (UI-only, fail-soft)
  // ==============================
  const [commentCount, setCommentCount] = useState<number>(0);

  const firstMedia = post.media?.[0];
  const mediaSrc = firstMedia?.cdnUrl ?? firstMedia?.url;

  const ogImage =
    firstMedia?.type === "image" ? mediaSrc : undefined;

  const ogVideo =
    firstMedia?.type === "video" ? mediaSrc : undefined;
  
    /**
   * ==============================
   * 🔔 Scroll to mentioned comment
   * ==============================
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (!hash.startsWith("#comment-")) return;

    const targetId = hash.slice(1); // comment-xxx

    let attempts = 0;
    const maxAttempts = 10;

    const tryScroll = () => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        return;
      }

      // retry เผื่อ comment ยังโหลดไม่เสร็จ
      if (attempts < maxAttempts) {
        attempts += 1;
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

        <link
          rel="canonical"
          href={`https://www.phlyphant.com/posts/${post.id}`}
        />

        <meta property="og:type" content="article" />
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
          content={`https://www.phlyphant.com/posts/${post.id}`}
        />

        {ogImage && (
          <meta property="og:image" content={ogImage} />
        )}

        {ogVideo && (
          <>
            <meta property="og:video" content={ogVideo} />
            <meta
              property="og:video:type"
              content="video/mp4"
            />
          </>
        )}
      </Head>

      <main
        className="
          mx-auto
          w-full
          max-w-sm
          sm:max-w-md
          md:max-w-2xl
          px-4
          sm:px-6
          py-6
          sm:py-8
        "
      >
        <article
          aria-label="Post content"
          className="w-full"
        >
          {/* ===== Post ===== */}
          <PostDetail post={post} />

          {/* ===== Comments ===== */}
          <section
            className="mt-6 border-t pt-4"
            aria-label="Post comments"
          >
            <CommentComposer
              postId={post.id}
              onCreated={() => {
                // fail-soft
                setCommentCount((c) => c + 1);
              }}
            />

            <CommentList
              postId={post.id}
              onDeleted={() => {
                setCommentCount((c) =>
                  Math.max(0, c - 1)
                );
              }}
            />
          </section>
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

    // optional auth (SEO-safe)
    await requireSessionSSR(ctx, { optional: true });

    try {
      const post = await getPostById(postId, ctx);

      if (!post) {
        return { notFound: true };
      }

      return {
        props: { post },
      };
    } catch {
      return { notFound: true };
    }
  };

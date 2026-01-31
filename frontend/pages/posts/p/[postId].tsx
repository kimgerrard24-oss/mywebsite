// frontend/pages/p/[postId].tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import { useEffect } from "react";

import PostPublicDetail from "@/components/posts/PostPublicDetail";
import { getPublicPostById } from "@/lib/api/public-posts";
import type { PublicPostDetail } from "@/types/public-post-detail";

type Props = {
  post: PublicPostDetail;
};

export default function PublicPostPage({ post }: Props) {
  const firstMedia = post.media?.[0];
  const mediaSrc = firstMedia?.cdnUrl ?? firstMedia?.url;

  const ogImage =
    firstMedia?.type === "image" ? mediaSrc : undefined;

  const ogVideo =
    firstMedia?.type === "video" ? mediaSrc : undefined;

  // Scroll to comment anchor (client-only)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (!hash.startsWith("#comment-")) return;

    const targetId = hash.slice(1);

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
          href={`https://www.phlyphant.com/p/${post.id}`}
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
          content={`https://www.phlyphant.com/p/${post.id}`}
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
        <article aria-label="Public post content">
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

    try {
      const post = await getPublicPostById(postId, ctx);

      if (!post) {
        // ❗ public route ต้องจบที่นี่
        return {
          notFound: true,
        };
      }

      return {
        props: { post },
      };
    } catch (err: any) {
      const status = err?.response?.status ?? null;

      if (status === 403) {
        return {
          notFound: true,
        };
      }

      if (status === 404) {
        return {
          notFound: true,
        };
      }

      throw err; // ให้ Next.js handle 500
    }
  };


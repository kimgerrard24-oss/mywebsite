// frontend/pages/posts/[postId].tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import PostDetail from "@/components/posts/PostDetail";
import { getPostById } from "@/lib/api/posts";
import { requireSessionSSR } from "@/lib/auth/require-session-ssr";
import type { PostDetail as PostDetailType } from "@/types/post-detail";

type Props = {
  post: PostDetailType;
};

export default function PostDetailPage({ post }: Props) {
  const router = useRouter();

  /**
   * ==============================
   * Media SEO (SAFE / OPTIONAL)
   * ==============================
   * - ใช้เฉพาะตัวแรก
   * - รองรับ cdnUrl + url (backward-safe)
   */
  const firstMedia = post.media?.[0];
  const mediaSrc = firstMedia?.cdnUrl ?? firstMedia?.url;

  const ogImage =
    firstMedia?.type === "image" ? mediaSrc : undefined;

  const ogVideo =
    firstMedia?.type === "video" ? mediaSrc : undefined;

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

        {/* ===== OpenGraph base ===== */}
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

        {/* ===== Media OG (optional, safe) ===== */}
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

      <main className="mx-auto max-w-2xl px-4 py-6">
        <article>
          <PostDetail post={post} />
        </article>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const postId = ctx.params?.postId;

  if (typeof postId !== "string") {
    return { notFound: true };
  }

  // optional session (SEO-safe)
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

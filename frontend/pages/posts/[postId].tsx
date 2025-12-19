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

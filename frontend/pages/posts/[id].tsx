// frontend/pages/posts/[id].tsx
import Head from "next/head";
import type { GetServerSideProps } from "next";
import PostDetail from "@/components/posts/PostDetail";
import { getPostById } from "@/lib/api/posts";
import { requireSessionSSR } from "@/lib/auth/require-session-ssr";
import type { PostDetail as PostDetailType } from "@/types/post-detail";

type Props = {
  post: PostDetailType;
};

export default function PostDetailPage({ post }: Props) {
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

export const getServerSideProps: GetServerSideProps<Props> =
  async (ctx) => {
 const postId = ctx.params?.postId as string;

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

// frontend/pages/admin/posts/[id].tsx

import type { GetServerSideProps } from "next";
import Head from "next/head";
import { sessionCheckServerSide } from "@/lib/api/api";
import { fetchAdminPostById } from "@/lib/api/admin-posts";
import AdminPostDetail from "@/components/admin/post/AdminPostDetail";
import type { AdminPostDetail as Post } from "@/types/admin-post";

type Props = {
  post: Post;
};

export default function AdminPostDetailPage({
  post,
}: Props) {
  return (
    <>
      <Head>
        <title>Admin Post | PhlyPhant</title>
      </Head>

      <main className="mx-auto max-w-4xl p-6">
        <h1 className="mb-4 text-xl font-semibold">
          Post Evidence
        </h1>

        <AdminPostDetail post={post} />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> =
  async (ctx) => {
    const session = await sessionCheckServerSide(
      ctx.req.headers.cookie,
    );

    if (!session.valid || session.role !== "ADMIN") {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    const id = ctx.params?.id as string;

    const post = await fetchAdminPostById(id, {
      cookieHeader: ctx.req.headers.cookie ?? "",
    });

    return {
      props: { post },
    };
  };

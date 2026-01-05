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
        <meta name="robots" content="noindex,nofollow" />
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

export const getServerSideProps: GetServerSideProps<
  Props
> = async (ctx) => {
  const session = await sessionCheckServerSide(
    ctx.req.headers.cookie,
  );

  // 🔒 AuthN only — backend decides ADMIN permission
  if (!session.valid) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const id = ctx.params?.id as string;

  try {
    // ✅ helper รับ argument เดียว
    const post = await fetchAdminPostById(id);

    return {
      props: { post },
    };
  } catch (err: any) {
    // ❌ ไม่ใช่ admin
    if (err?.status === 403) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    // ❌ post ไม่พบ
    if (err?.status === 404) {
      return { notFound: true };
    }

    // production-safe fallback
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};

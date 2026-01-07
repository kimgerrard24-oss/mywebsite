// frontend/pages/admin/comments/[id].tsx

import type { GetServerSideProps } from "next";
import Head from "next/head";
import { sessionCheckServerSide } from "@/lib/api/api";
import { fetchAdminCommentById } from "@/lib/api/admin-comments";
import AdminCommentDetail from "@/components/admin/comment/AdminCommentDetail";
import type { AdminCommentDetail as Comment } from "@/types/admin-comment";

type Props = {
  comment: Comment;
};

export default function AdminCommentDetailPage({
  comment,
}: Props) {
  return (
    <>
      <Head>
        <title>Admin Comment | PhlyPhant</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="mx-auto max-w-4xl p-6">
        <h1 className="mb-4 text-xl font-semibold">
          Comment Evidence
        </h1>

        <AdminCommentDetail comment={comment} />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<
  Props
> = async (ctx) => {
  const cookieHeader = ctx.req.headers.cookie ?? "";

  const session = await sessionCheckServerSide(
    cookieHeader,
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
    // 🔒 MUST forward cookie to backend (backend = authority)
    const comment = await fetchAdminCommentById(id, {
      cookieHeader,
    });

    return {
      props: { comment },
    };
  } catch (err: any) {
    // ❌ ไม่ใช่ admin → backend returns 403
    if (err?.status === 403) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    // ❌ comment ไม่พบ
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


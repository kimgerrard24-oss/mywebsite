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

    const comment = await fetchAdminCommentById(id, {
      cookieHeader: ctx.req.headers.cookie ?? "",
    });

    return {
      props: { comment },
    };
  };

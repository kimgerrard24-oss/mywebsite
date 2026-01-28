// frontend/pages/admin/shares/[id].tsx

import type { GetServerSideProps } from "next";
import Head from "next/head";

import { sessionCheckServerSide } from "@/lib/api/api";
import {
  fetchAdminShareById,
} from "@/lib/api/admin-shares";

import AdminShareDetail from "@/components/admin/share/AdminShareDetail";

import type {
  AdminShareDetail as ShareDetail,
} from "@/types/admin-share";

type Props = {
  share: ShareDetail;
};

export default function AdminShareDetailPage({
  share,
}: Props) {
  return (
    <>
      <Head>
        <title>Admin Share | PhlyPhant</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="mx-auto max-w-4xl p-6">
        <h1 className="mb-4 text-xl font-semibold">
          Share Moderation
        </h1>

        <AdminShareDetail share={share} />
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

  // 🔒 Auth only — backend enforces ADMIN
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
    const share = await fetchAdminShareById(id, {
      cookieHeader,
    });

    return {
      props: { share },
    };
  } catch (err: any) {
    if (err?.status === 403) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    if (err?.status === 404) {
      return { notFound: true };
    }

    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};

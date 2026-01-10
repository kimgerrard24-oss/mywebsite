// frontend/pages/admin/appeals/appeals/[id].tsx

import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

import { sessionCheckServerSide } from "@/lib/api/api";
import { getAdminAppealById } from "@/lib/api/admin-appeals";

import type { AdminAppealDetail } from "@/types/admin-appeal";
import AdminAppealDetailView from "@/components/admin/appeals/AdminAppealDetailView";

type Props = {
  appeal: AdminAppealDetail;
};

export default function AdminAppealDetailPage({
  appeal,
}: Props) {
  return (
    <>
      <Head>
        <title>Admin Appeal | PhlyPhant</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="mx-auto max-w-4xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            Appeal Review
          </h1>

          <Link
            href="/admin/appeals/appeals"
            className="text-sm text-blue-600 hover:underline"
          >
            Back
          </Link>
        </div>

        {/* authority = backend, ถ้ามาได้แปลว่าผ่าน guard แล้ว */}
        <AdminAppealDetailView appeal={appeal} />
      </main>
    </>
  );
}

/* ================= SSR ================= */

export const getServerSideProps: GetServerSideProps<
  Props
> = async (ctx) => {
  const cookieHeader = ctx.req.headers.cookie ?? "";

  // 🔐 AuthN only — backend decides ADMIN permission
  const session = await sessionCheckServerSide(
    cookieHeader,
  );

  if (!session.valid) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const id = ctx.params?.id as string | undefined;

  if (!id) {
    return { notFound: true };
  }

  try {
    // 🔐 SSR must forward cookie to backend
    const appeal = await getAdminAppealById({
      appealId: id,
      cookie: cookieHeader,
    });

    return {
      props: { appeal },
    };
  } catch (err: any) {
    // ❌ backend denies admin
    if (err?.status === 403) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    // ❌ appeal not found
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

// frontend/pages/admin/appeals/appeals/[id].tsx

import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { sessionCheckServerSide } from '@/lib/api/api';
import { getAdminAppealById } from '@/lib/api/admin-appeals';
import type { AdminAppealDetail } from '@/types/admin-appeal';
import AdminAppealDetailView from '@/components/admin/appeals/AdminAppealDetailView';

type Props = {
  appeal: AdminAppealDetail | null;
};

export default function AdminAppealDetailPage({
  appeal,
}: Props) {
  return (
    <>
      <Head>
        {/* ✅ aligned with reference file */}
        <title>Admin Appeal | PhlyPhant</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="mx-auto max-w-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          {/* ✅ aligned with reference file */}
          <h1 className="text-xl font-semibold">
            Appeal Review
          </h1>

          <Link
            href="/admin/appeals"
            className="text-sm text-blue-600 hover:underline"
          >
            Back
          </Link>
        </div>

        {!appeal ? (
          <p className="text-sm text-gray-600">
            Appeal not found or unavailable.
          </p>
        ) : (
          <AdminAppealDetailView appeal={appeal} />
        )}
      </main>
    </>
  );
}

/* ================= SSR ================= */

export const getServerSideProps: GetServerSideProps<
  Props
> = async (ctx) => {
  const cookieHeader =
    ctx.req.headers.cookie ?? '';

  // 🔐 AuthN only — backend is authority
  const session = await sessionCheckServerSide(
    cookieHeader,
  );

  if (!session.valid) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const appealId = String(
    ctx.params?.id ?? '',
  );

  if (!appealId) {
    return { props: { appeal: null } };
  }

  try {
    const appeal = await getAdminAppealById({
      appealId,
      cookie: cookieHeader,
    });

    return {
      props: { appeal },
    };
  } catch (err: any) {
    if (err?.status === 403) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    return {
      props: { appeal: null },
    };
  }
};


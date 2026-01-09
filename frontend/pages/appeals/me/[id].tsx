// frontend/pages/appeals/me/[id].tsx

import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { sessionCheckServerSide } from '@/lib/api/api';
import { getMyAppealById } from '@/lib/api/appeals';
import type { MyAppealDetail } from '@/types/appeal';
import MyAppealDetailView from '@/components/appeals/MyAppealDetail';

type Props = {
  appeal: MyAppealDetail | null;
};

export default function MyAppealDetailPage({
  appeal,
}: Props) {
  return (
    <>
      <Head>
        <title>Appeal Detail | PhlyPhant</title>
        <meta
          name="robots"
          content="noindex,nofollow"
        />
      </Head>

      <main className="mx-auto max-w-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            Appeal Detail
          </h1>

          <Link
            href="/appeals/me"
            className="text-sm text-blue-600 hover:underline"
          >
            Back to my appeals
          </Link>
        </div>

        {!appeal ? (
          <p className="text-sm text-gray-600">
            Appeal not found or unavailable.
          </p>
        ) : (
          <MyAppealDetailView appeal={appeal} />
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

  // 🔐 AuthN only — backend authority
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
    const appeal = await getMyAppealById({
      appealId,
      cookie: cookieHeader,
    });

    return {
      props: {
        appeal,
      },
    };
  } catch {
    // production-safe: do not leak
    return {
      props: {
        appeal: null,
      },
    };
  }
};

// frontend/pages/users/[userId]/following.tsx

import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import FollowingList from '@/components/following/FollowingList';

/**
 * =========================
 * Page Props
 * =========================
 */
type Props = {
  userId: string;
};

/**
 * =========================
 * Page Component
 * =========================
 */
export default function FollowingPage({ userId }: Props) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Following · PhlyPhant</title>
        <meta
          name="description"
          content="People this user is following on PhlyPhant"
        />
        <meta name="robots" content="index,follow" />
      </Head>

      <main
        className="
          mx-auto
          w-full
          max-w-2xl
          px-4
          py-6
          sm:py-8
        "
      >
        {/* ================= Header ================= */}
        <header className="mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="
              mb-3
              text-sm
              font-medium
              text-gray-600
              hover:underline
            "
            aria-label="Go back"
          >
            ← Back
          </button>

          <h1
            className="
              text-xl
              sm:text-2xl
              font-semibold
              text-gray-900
            "
          >
            Following
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            People this user is following
          </p>
        </header>

        {/* ================= Following List ================= */}
        <section aria-labelledby="following-heading">
          <h2 id="following-heading" className="sr-only">
            Following list
          </h2>

          <FollowingList userId={userId} />
        </section>
      </main>
    </>
  );
}

/**
 * =========================
 * SSR: Validate userId
 * =========================
 */
export const getServerSideProps: GetServerSideProps<Props> = async (
  context,
) => {
  const { userId } = context.params ?? {};

  if (!userId || typeof userId !== 'string') {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      userId,
    },
  };
};

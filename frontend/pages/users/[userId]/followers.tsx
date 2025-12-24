// frontend/pages/users/[userId]/followers.tsx

import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import FollowersList from '@/components/followers/FollowersList';

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
export default function FollowersPage({ userId }: Props) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Followers · PhlyPhant</title>
        <meta
          name="description"
          content="People who follow this user on PhlyPhant"
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
            Followers
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            People who follow this user
          </p>
        </header>

        {/* ================= Followers List ================= */}
        <section aria-labelledby="followers-heading">
          <h2 id="followers-heading" className="sr-only">
            Followers list
          </h2>

          <FollowersList userId={userId} />
        </section>
      </main>
    </>
  );
}

/**
 * =========================
 * SSR: Get userId safely
 * =========================
 */
export const getServerSideProps: GetServerSideProps<Props> = async (
  context,
) => {
  const { id } = context.params ?? {};

  if (!id || typeof id !== 'string') {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      userId: id,
    },
  };
};

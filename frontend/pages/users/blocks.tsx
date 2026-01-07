// frontend/pages/users/blocks.tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import BlockedUserList from "@/components/users/BlockedUserList";
import { useMyBlockedUsers } from "@/hooks/useMyBlockedUsers";
import { getMyBlockedUsersServer } from "@/lib/api/user";
import { sessionCheckServerSide } from "@/lib/api/api";

type Props = {
  initialData: {
    items: Array<{
      id: string;
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
      blockedAt: string;
    }>;
    nextCursor: string | null;
  };
};

export default function MyBlockedUsersPage({
  initialData,
}: Props) {
  const {
    items,
    loading,
    error,
    hasMore,
    loadMore,
  } = useMyBlockedUsers(initialData);

  return (
    <>
      <Head>
        <title>Blocked Users | PhlyPhant</title>
        <meta
          name="description"
          content="Users you have blocked"
        />
      </Head>

      <main className="mx-auto max-w-xl p-4">
        <h1 className="mb-4 text-lg font-semibold">
          Blocked Users
        </h1>

        <BlockedUserList items={items} />

        {error && (
          <p className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {hasMore && (
          <button
            type="button"
            onClick={() => loadMore(false)}
            disabled={loading}
            className="mt-4 rounded border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
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
    ctx.req.headers.cookie ?? "";

  // 🔒 Session authority (backend decides)
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

  try {
    // 🔒 Backend is authority
    const data = await getMyBlockedUsersServer(
      cookieHeader,
    );

    return {
      props: {
        initialData: data,
      },
    };
  } catch {
    // production-safe fallback
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};


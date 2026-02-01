// frontend/pages/settings/hided-posts.tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import { sessionCheckServerSide } from "@/lib/api/api";
import { getMyHiddenTaggedPosts } from "@/lib/api/hided-posts";
import { useMyHiddenTaggedPosts } from "@/hooks/useMyHiddenTaggedPosts";
import HiddenTaggedPostList from "@/components/hided-posts/HiddenTaggedPostList";

type Props = {
  initialData: {
    items: any[];
    nextCursor: string | null;
  };
};

export default function HiddenTaggedPostsPage({
  initialData,
}: Props) {
  const {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    unhide,
  } = useMyHiddenTaggedPosts(initialData);

  return (
    <>
      <Head>
        <title>Hidden Tagged Posts | PhlyPhant</title>
      </Head>

      <main className="mx-auto max-w-xl p-4">
        <h1 className="mb-1 text-lg font-semibold">
          โพสต์ที่คุณซ่อนไว้
        </h1>
        <p className="mb-4 text-sm text-gray-500">
          โพสต์ที่เพื่อนแท็กคุณ แต่คุณเลือกไม่ให้แสดงบนโปรไฟล์
        </p>

        <HiddenTaggedPostList
          items={items}
          onUnhide={unhide}
        />

        {error && (
          <p className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {hasMore && (
          <button
            type="button"
            onClick={loadMore}
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

export const getServerSideProps: GetServerSideProps<
  Props
> = async (ctx) => {
  const cookie = ctx.req.headers.cookie ?? "";

  const session = await sessionCheckServerSide(cookie);
  if (!session.valid) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  try {
    const data = await getMyHiddenTaggedPosts(cookie);
    return {
      props: {
        initialData: data,
      },
    };
  } catch {
    return {
      props: {
        initialData: { items: [], nextCursor: null },
      },
    };
  }
};

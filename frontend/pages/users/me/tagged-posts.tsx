// frontend/pages/users/me/tagged-posts.tsx

import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { sessionCheckServerSide } from "@/lib/api/api";
import type { MyTaggedPostItem } from "@/types/tagged-posts";
import TaggedPostList from "@/components/posts/TaggedPostList";

type Props = {
  items: MyTaggedPostItem[];
  nextCursor: string | null;
};

export default function MyTaggedPostsPage({
  items,
  nextCursor,
}: Props) {
  return (
    <>
      <Head>
        <title>Tagged Posts | PhlyPhant</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="mx-auto max-w-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            Posts you are tagged in
          </h1>

          <Link
            href="/users/me"
            className="text-sm text-blue-600 hover:underline"
          >
            Back to profile
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-gray-600">
            You are not tagged in any posts yet.
          </p>
        ) : (
          <TaggedPostList
  items={items}
  nextCursor={nextCursor}
/>

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

  // 🔐 AuthN only — backend is authority
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
    const base =
      process.env.INTERNAL_BACKEND_URL ??
      process.env.NEXT_PUBLIC_BACKEND_URL ??
      "https://api.phlyphant.com";

    const res = await fetch(
      `${base}/users/me/tagged-posts?limit=20`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(cookieHeader
            ? { Cookie: cookieHeader }
            : {}),
        },
        credentials: "include",
        cache: "no-store",
      },
    );

    if (!res.ok) {
      throw new Error(
        "Failed to load tagged posts",
      );
    }

    const data = (await res.json()) as {
      items: MyTaggedPostItem[];
      nextCursor: string | null;
    };

    return {
      props: {
        items: data.items ?? [],
        nextCursor: data.nextCursor ?? null,
      },
    };
  } catch {
    // production-safe fallback
    return {
      props: {
        items: [],
        nextCursor: null,
      },
    };
  }
};

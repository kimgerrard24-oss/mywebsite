// frontend/pages/media/me.tsx

import type { GetServerSideProps } from "next";
import Head from "next/head";
import { sessionCheckServerSide } from "@/lib/api/api";
import type { MyMediaGalleryItem } from "@/types/my-media";
import MyMediaGallery from "@/components/media/MyMediaGallery";

type Props = {
  items: MyMediaGalleryItem[];
  nextCursor: string | null;
};

export default function MyMediaPage({
  items,
  nextCursor,
}: Props) {
  return (
    <>
      <Head>
        <title>Your Media | PhlyPhant</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="mx-auto max-w-5xl p-6">
        <header className="mb-4">
          <h1 className="text-xl font-semibold">
            Your Media
          </h1>
          <p className="text-sm text-gray-600">
            Photos and videos you have uploaded
          </p>
        </header>

        {items.length === 0 ? (
          <p className="text-sm text-gray-600">
            You haven’t uploaded any media yet.
          </p>
        ) : (
          <MyMediaGallery
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
      `${base}/media/me?limit=24`,
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
      throw new Error("Failed to load media");
    }

    const data = (await res.json()) as {
      items: MyMediaGalleryItem[];
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

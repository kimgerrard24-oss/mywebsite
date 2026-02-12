// frontend/pages/media/me.tsx

import type { GetServerSideProps } from "next";
import Head from "next/head";
import { sessionCheckServerSide } from "@/lib/api/api";
import type { MyMediaGalleryItem } from "@/types/my-media";
import MyMediaGallery from "@/components/media/MyMediaGallery";
import Link from "next/link";

type MediaTypeTab = "all" | "image" | "video";

type Props = {
  items: MyMediaGalleryItem[];
  nextCursor: string | null;
  activeType: MediaTypeTab;
};

export default function MyMediaPage({
  items,
  nextCursor,
  activeType,
}: Props) {
  return (
    <>
      <Head>
        <title>Your Media | PhlyPhant</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="mx-auto max-w-5xl p-6">

        {/* ===== Top navigation ===== */}
  <nav
    aria-label="Media navigation"
    className="mb-4"
  >
    <Link
      href="/feed"
      prefetch={false}
      className="
        inline-block
        text-xs
        sm:text-sm
        text-blue-600
        hover:underline
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-blue-500
        rounded
      "
    >
      ← Back to feed
    </Link>
  </nav>
  
        <header className="mb-4">
          <h1 className="text-xl font-semibold">Your Media</h1>
          <p className="text-sm text-gray-600">
            Photos and videos you have uploaded
          </p>
        </header>

        {/* ===============================
         * Media Type Tabs
         * =============================== */}
        <nav
          aria-label="Media type filter"
          className="mb-4 flex gap-2"
        >
          {[
            { key: "all", label: "All" },
            { key: "image", label: "Images" },
            { key: "video", label: "Videos" },
          ].map((tab) => {
            const href =
              tab.key === "all"
                ? "/media/me"
                : `/media/me?type=${tab.key}`;

            const isActive = activeType === tab.key;

            return (
              <a
                key={tab.key}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded px-3 py-1.5 text-sm font-medium ${
                  isActive
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </a>
            );
          })}
        </nav>

        {/* ===============================
         * Gallery
         * =============================== */}
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
  const cookieHeader = ctx.req.headers.cookie ?? "";

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

  // ===============================
  // Media type (URL = source of truth)
  // ===============================
  const rawType = ctx.query.type;
  const activeType: MediaTypeTab =
    rawType === "image" || rawType === "video"
      ? rawType
      : "all";

  try {
    const base =
      process.env.INTERNAL_BACKEND_URL ??
      process.env.NEXT_PUBLIC_BACKEND_URL ??
      "https://api.phlyphant.com";

    const url = new URL(
      `${base}/media/me/gallery`,
    );
    url.searchParams.set("limit", "24");

    if (activeType !== "all") {
      url.searchParams.set("type", activeType);
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(cookieHeader
          ? { Cookie: cookieHeader }
          : {}),
      },
      credentials: "include",
      cache: "no-store",
    });

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
        activeType,
      },
    };
  } catch {
    // production-safe fallback
    return {
      props: {
        items: [],
        nextCursor: null,
        activeType,
      },
    };
  }
};

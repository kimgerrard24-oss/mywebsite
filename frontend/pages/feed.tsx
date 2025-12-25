// ==============================
// file: pages/feed.tsx
// ==============================

import Head from "next/head";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import cookie from "cookie";
import { api } from "@/lib/api/api";
import { getPublicFeed } from "@/lib/api/posts";
import type { PostFeedItem } from "@/types/post-feed";
import { getDictionary, type Lang } from "@/lib/i18n";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import UserSearchPanel from "@/components/users/UserSearchPanel";
import TextFeed from "@/components/feed/TextFeed";
import VideoFeed from "@/components/feed/ShortVideoFeed";
import PostComposer from "@/components/posts/PostComposer";
import FeedModeSwitcher from "@/components/common/FeedModeSwitcher";
import { useState } from "react";
import { useRef } from "react";

type FeedProps = {
  user: any | null;
  feedItems: PostFeedItem[];
  lang: Lang;
};

export default function FeedPage({
  user,
  feedItems,
  lang,
}: FeedProps) {
  const router = useRouter();
  const t = getDictionary(lang);

  const [feedMode, setFeedMode] = useState<"text" | "video">("video");
  const refreshFeedRef = useRef<() => void>(() => {});

  const handleLogout = async () => {
    try {
      await api.post("/auth/local/logout", {});
    } catch (err) {
      console.error("Logout failed:", err);
    }
    router.replace("/");
  };

return (
  <>
    {/* ================= SEO ================= */}
    <Head>
      <title>{t.feed.pageTitle}</title>
      <meta name="description" content={t.feed.pageDescription} />
      <meta property="og:title" content={t.feed.pageTitle} />
      <meta property="og:description" content={t.feed.ogDescription} />
    </Head>

    {/* ================= Root Layout ================= */}
    <main
      className="
        min-h-screen
        flex
        flex-col
        bg-gray-50
        text-gray-900
      "
    >
      {/* ================= Header (LOCKED) ================= */}
      <header
        className="
          sticky
          top-0
          z-20
          w-full
          bg-white
          shadow-sm
        "
      >
        <nav
          aria-label="Primary navigation"
          className="
            mx-auto
            flex
            h-14
            max-w-6xl
            items-center
            justify-between
            gap-2
            px-3
            sm:px-4
            md:px-6
            sm:gap-4
          "
        >
          {/* ===== Left: Logo ===== */}
          <Link
            href="/feed"
            className="
              shrink-0
              text-lg
              sm:text-xl
              font-semibold
              tracking-tight
              leading-none
              text-blue-600
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-blue-500
              rounded
            "
          >
            PhlyPhant
          </Link>

          {/* ===== Center: Search (GLOBAL) ===== */}
          <div className="flex-1 flex justify-center px-2">
            <div className="hidden w-full max-w-md md:block">
              <UserSearchPanel variant="navbar" />
            </div>
          </div>

          {/* ===== Right: Actions ===== */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitcher currentLang={lang} />

            <Link
              href="/profile"
              aria-label="Go to profile"
              className="
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-blue-500
                rounded-full
              "
            >
              <img
                src={user?.avatarUrl || "/images/default-avatar.png"}
                alt="User avatar"
                className="
                  h-8
                  w-8
                  sm:h-9
                  sm:w-9
                  rounded-full
                  border
                  object-cover
                  cursor-pointer
                  transition
                  hover:ring-2
                  hover:ring-blue-500
                "
              />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="
                hidden
                sm:inline-block
                text-sm
                font-medium
                transition-colors
                hover:text-red-600
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-red-500
                rounded
              "
            >
              {t.feed.nav.logout}
            </button>
          </div>
        </nav>
      </header>

      {/* ===== Mobile Search ===== */}
      <section
        className="px-3 pt-3 sm:px-4 md:hidden"
        aria-label="Search users"
      >
        <UserSearchPanel variant="page" />
      </section>

      {/* ===== Mobile Feed Mode Switcher ===== */}
      <section
        className="px-3 pt-3 sm:px-4 lg:hidden"
        aria-label="Feed mode switcher"
      >
        <FeedModeSwitcher onChange={setFeedMode} />
      </section>

      {/* ================= Feeds Area ================= */}
      <section aria-label="Feeds">
        <div
          className="
            grid
            grid-cols-1
            lg:h-[calc(100vh-56px)]
            lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]
          "
        >
          {/* ===== Left: Text Feed ===== */}
          <aside
            aria-label="Text feed"
            className={`
              border-r
              bg-gray-50
              flex
              flex-col
              ${feedMode === "video" ? "hidden" : "flex"}
              lg:flex
              lg:h-full
              lg:overflow-y-auto
            `}
          >
            {/* Composer */}
            <div className="bg-gray-50 border-b border-gray-100">
              <div className="mx-auto max-w-3xl px-3 py-2 sm:px-4">
                <PostComposer
                  onPostCreated={() =>
                    refreshFeedRef.current?.()
                  }
                />
              </div>
            </div>

            {/* Feed list */}
            <TextFeed
              user={user}
              initialItems={feedItems}
              lang={lang}
              showComposer={false}
              onRefreshReady={(fn) => {
                refreshFeedRef.current = fn;
              }}
            />
          </aside>

          {/* ===== Right: Video Feed ===== */}
          <aside
            aria-label="Video feed"
            className={`
              bg-black
              ${feedMode === "text" ? "hidden" : "block"}
              lg:block
              lg:h-full
              lg:overflow-y-auto
            `}
          >
            {/* 🔥 render เฉพาะตอนที่ใช้งานจริง */}
            {(feedMode !== "text" || typeof window === "undefined") && (
              <VideoFeed />
            )}
          </aside>
        </div>
      </section>
    </main>
  </>
);


}

/* ================= SSR ================= */

export const getServerSideProps: GetServerSideProps =
  async (ctx) => {
    const cookieHeader =
      ctx.req.headers.cookie ?? "";
    const cookies = cookie.parse(cookieHeader);
    const lang = (cookies.lang as Lang) ?? "th";

    const baseUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE ||
      "https://api.phlyphant.com";

    const apiBase = baseUrl.replace(/\/+$/, "");

    const sessionRes = await fetch(
      `${apiBase}/auth/session-check`,
      {
        headers: {
          Accept: "application/json",
          ...(cookieHeader
            ? { Cookie: cookieHeader }
            : {}),
        },
        credentials: "include",
        cache: "no-store",
      }
    );

    if (!sessionRes.ok) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    const sessionJson =
      await sessionRes.json().catch(() => null);

    if (!sessionJson?.valid) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    const feed = await getPublicFeed({
      cookie: cookieHeader,
    });

    let user: any | null = null;

    try {
      const userRes = await fetch(
        `${apiBase}/users/me`,
        {
          headers: {
            Accept: "application/json",
            ...(cookieHeader
              ? { Cookie: cookieHeader }
              : {}),
          },
          credentials: "include",
          cache: "no-store",
        }
      );

      if (userRes.ok) {
        user = await userRes.json().catch(
          () => null
        );
      }
    } catch {}

    return {
      props: {
        user,
        feedItems: feed.items,
        lang,
      },
    };
  };

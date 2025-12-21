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
      <meta
        name="description"
        content={t.feed.pageDescription}
      />
      <meta
        property="og:title"
        content={t.feed.pageTitle}
      />
      <meta
        property="og:description"
        content={t.feed.ogDescription}
      />
    </Head>

    {/* ================= Root Layout ================= */}
    <main
      className="
        h-screen
        flex
        flex-col
        bg-gray-50
        text-gray-900
        overflow-hidden
      "
    >
      {/* ================= Header (LOCKED) ================= */}
      <header className="shrink-0 w-full bg-white shadow-sm sticky top-0 z-20">
        <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/feed"
            className="text-2xl font-semibold tracking-tight text-blue-600"
          >
            PhlyPhant
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSwitcher currentLang={lang} />

            <Link
              href="/dashboard"
              className="hidden sm:block text-sm font-medium hover:text-blue-600 transition"
            >
              {t.feed.nav.dashboard}
            </Link>

            <Link
              href="/profile"
              className="hidden sm:block text-sm font-medium hover:text-blue-600 transition"
            >
              {t.feed.nav.profile}
            </Link>

            <img
              src={
                user?.avatarUrl ||
                "/images/default-avatar.png"
              }
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border object-cover"
              alt="Avatar"
            />

            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium hover:text-red-600 transition"
            >
              {t.feed.nav.logout}
            </button>
          </div>
        </nav>
      </header>

      {/* ================= Search (LOCKED) ================= */}
      <section className="shrink-0 max-w-3xl mx-auto px-4 py-6">
        <UserSearchPanel variant="feed" />
      </section>

      {/* ================= Feeds Area (SCROLL SEPARATE) ================= */}
      <section className="flex-1 overflow-hidden">
        <div
          className="
            h-full
            grid
            grid-cols-1
            lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]
          "
        >
          {/* ===== Left: Text Feed (OWN SCROLL) ===== */}
          <aside
            className="
              h-full
              overflow-y-auto
              overscroll-contain
              border-r
              bg-gray-50
            "
          >
            <TextFeed
              user={user}
              initialItems={feedItems}
              lang={lang}
            />
          </aside>

          {/* ===== Right: Video Feed (OWN SCROLL) ===== */}
          <aside
            className="
              hidden
              lg:block
              h-full
              overflow-y-auto
              overscroll-contain
              bg-black
            "
          >
            <VideoFeed />
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

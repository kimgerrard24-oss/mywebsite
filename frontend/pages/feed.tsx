// ==============================
// file: pages/feed.tsx
// ==============================

import Head from "next/head";
import type { GetServerSideProps } from "next";
import { api } from "@/lib/api/api";
import { getPublicFeed } from "@/lib/api/posts";
import type { PostFeedItem } from "@/types/post-feed";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import Link from "next/link";
import cookie from "cookie";

import UserSearchPanel from "@/components/users/UserSearchPanel";
import PostComposer from "@/components/posts/PostComposer";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

import { getDictionary, type Lang } from "@/lib/i18n";

type FeedProps = {
  user: any | null;
  feedItems: PostFeedItem[];
  lang: Lang;
};

export default function FeedPage({ user, feedItems, lang }: FeedProps) {
  const router = useRouter();
  const t = getDictionary(lang);

  const [items, setItems] = useState<PostFeedItem[]>(feedItems);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await api.post("/auth/local/logout", {});
    } catch (err) {
      console.error("Logout failed:", err);
    }

    router.replace("/");
  }, [router]);

  const refreshFeed = useCallback(async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);
      const res = await api.get<{ items: PostFeedItem[] }>("/posts", {
        params: { limit: 20 },
        withCredentials: true,
      });

      if (Array.isArray(res.data?.items)) {
        setItems(res.data.items);
      }
    } catch (err) {
      console.error("Refresh feed failed:", err);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing]);

  return (
    <>
      {/* ================= SEO ================= */}
      <Head>
        <title>{t.feed.pageTitle}</title>
        <meta name="description" content={t.feed.pageDescription} />
        <meta property="og:title" content={t.feed.pageTitle} />
        <meta property="og:description" content={t.feed.ogDescription} />
      </Head>

      <main className="min-h-screen bg-gray-50 text-gray-900">
        {/* ================= Header ================= */}
        <header className="w-full bg-white shadow-sm sticky top-0 z-20">
          <nav className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
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
                src={user?.avatarUrl || "/images/default-avatar.png"}
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

        {/* ================= Search ================= */}
        <section className="max-w-3xl mx-auto px-4 py-6">
          <UserSearchPanel variant="feed" />
        </section>

        {/* ================= Feed ================= */}
        <section
          className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6"
          aria-label="User feed"
        >
          <PostComposer onPostCreated={refreshFeed} />

          <article className="bg-white p-5 sm:p-6 rounded-2xl shadow border">
            <h2 className="text-lg sm:text-xl font-semibold">
              {t.feed.greeting}{" "}
              {user?.displayName ||
                user?.email ||
                t.feed.greetingFallback}
            </h2>
            <p className="text-gray-600 mt-1">{t.feed.intro}</p>
          </article>

          {items.length === 0 && (
            <p className="text-center text-gray-500">
              {t.feed.empty}
            </p>
          )}

          {items.map((post) => (
            <article
              key={post.id}
              className="bg-white shadow-sm border rounded-2xl p-4 sm:p-5 flex flex-col gap-4"
              aria-label={t.feed.post.aria}
            >
              {/* ===== Header: โปรไฟล์ผู้เขียน (คลิกได้) ===== */}
              <header className="flex items-center gap-3">
                <Link
                  href={`/users/${post.author.id}`}
                  className="flex items-center gap-3 hover:underline"
                >
                  {post.author.avatarUrl ? (
                    <img
                      src={post.author.avatarUrl}
                      alt={
                        post.author.displayName ??
                        t.feed.post.authorFallback
                      }
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-300" />
                  )}

                  <div>
                    <h3 className="font-semibold text-sm">
                      {post.author.displayName ??
                        t.feed.post.authorFallback}
                    </h3>

                    <time
                      className="text-gray-500 text-xs"
                      dateTime={post.createdAt}
                    >
                      {new Date(post.createdAt).toLocaleString()}
                    </time>
                  </div>
                </Link>
              </header>

              {/* ================= CLICK TO POST DETAIL ================= */}
              <Link
                href={`/posts/${post.id}`}
                className="block"
              >
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap hover:underline cursor-pointer">
                  {post.content}
                </p>
              </Link>

              <footer className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-600">
                <span>
                  ❤️ {post.stats.likeCount} {t.feed.post.likes}
                </span>
                <span>
                  💬 {post.stats.commentCount} {t.feed.post.comments}
                </span>
              </footer>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookieHeader = ctx.req.headers.cookie ?? "";
  const cookies = cookie.parse(cookieHeader);
  const lang = (cookies.lang as Lang) ?? "th";

  /* ===== auth / feed logic เดิม ไม่เปลี่ยน ===== */

  const baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "https://api.phlyphant.com";

  const apiBase = baseUrl.replace(/\/+$/, "");

  const sessionRes = await fetch(`${apiBase}/auth/session-check`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!sessionRes.ok) {
    return {
      redirect: { destination: "/", permanent: false },
    };
  }

  const sessionJson = await sessionRes.json().catch(() => null);
  if (!sessionJson || sessionJson.valid !== true) {
    return {
      redirect: { destination: "/", permanent: false },
    };
  }

  const feed = await getPublicFeed({ cookie: cookieHeader });

  let user: any | null = null;

  try {
    const userRes = await fetch(`${apiBase}/users/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      credentials: "include",
      cache: "no-store",
    });

    if (userRes.ok) {
      const json = await userRes.json().catch(() => null);
      if (json?.data && typeof json.data === "object") {
        user = json.data;
      } else if (json?.id) {
        user = json;
      }
    }
  } catch {
    // fail-soft
  }

  return {
    props: {
      user,
      feedItems: feed.items,
      lang,
    },
  };
};

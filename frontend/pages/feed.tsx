// ==============================
// file: pages/feed.tsx
// ==============================

import Head from "next/head";
import type { GetServerSideProps } from "next";
import { api } from "@/lib/api/api";
import { getPublicFeed } from "@/lib/api/posts";
import type { PostFeedItem } from "@/types/post-feed";
import { useRouter } from "next/router";
import { useCallback } from "react";
import Link from "next/link";
import UserSearchPanel from "@/components/users/UserSearchPanel";

type FeedProps = {
  user: any | null;
  feedItems: PostFeedItem[];
};

export default function FeedPage({ user, feedItems }: FeedProps) {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      await api.post("/auth/local/logout", {});
    } catch (err) {
      console.error("Logout failed:", err);
    }

    router.replace("/");
  }, [router]);

  return (
    <>
      <Head>
        <title>PhlyPhant Feed</title>
        <meta
          name="description"
          content="ดูโพสต์ล่าสุดจากผู้คนบน PhlyPhant — แพลตฟอร์มโซเชียลของไทย."
        />
        <meta property="og:title" content="PhlyPhant Feed" />
        <meta
          property="og:description"
          content="เข้าร่วมการสนทนาบน PhlyPhant และดูโพสต์ล่าสุดจากเพื่อนๆ"
        />
      </Head>

      <main className="min-h-screen bg-gray-50 text-gray-900">
        {/* ================= Header ================= */}
        <header className="w-full bg-white shadow-sm sticky top-0 z-20">
          <nav className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <a
              href="/feed"
              className="text-2xl font-semibold tracking-tight text-blue-600"
            >
              PhlyPhant
            </a>

            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="text-sm font-medium hover:text-blue-600 transition"
              >
                Dashboard
              </a>

              <Link
                href="/profile"
                className="text-sm font-medium hover:text-blue-600 transition"
              >
                Profile
              </Link>

              <img
                src={user?.avatarUrl || "/images/default-avatar.png"}
                className="w-10 h-10 rounded-full border object-cover"
                alt="Avatar"
              />

              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium hover:text-red-600 transition"
              >
                Logout
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
          <article className="bg-white p-6 rounded-2xl shadow border">
            <h2 className="text-xl font-semibold">
              สวัสดี {user?.displayName || user?.email || "ผู้ใช้"}
            </h2>
            <p className="text-gray-600 mt-1">
              ดูโพสต์ล่าสุดจากชุมชนของคุณบน PhlyPhant
            </p>
          </article>

          {feedItems.length === 0 && (
            <p className="text-center text-gray-500">
              ยังไม่มีโพสต์ในตอนนี้
            </p>
          )}

          {feedItems.map((post) => (
            <article
              key={post.id}
              className="bg-white shadow-sm border rounded-2xl p-5 flex flex-col gap-4"
              aria-label="Post"
            >
              <header>
                <h3 className="font-semibold text-sm">
                  ผู้ใช้ {post.authorId}
                </h3>
                <time
                  className="text-gray-500 text-xs"
                  dateTime={post.createdAt}
                >
                  {new Date(post.createdAt).toLocaleString()}
                </time>
              </header>

              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>

              <footer className="flex items-center gap-6 text-sm text-gray-600">
                <span>❤️ {post.stats.likeCount}</span>
                <span>💬 {post.stats.commentCount}</span>
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

  const baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "https://api.phlyphant.com";

  const apiBase = baseUrl.replace(/\/+$/, "");

  // 1️⃣ Session check (AUTHORITY)
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
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const sessionJson = await sessionRes.json().catch(() => null);
  if (!sessionJson || sessionJson.valid !== true) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // 2️⃣ Load feed (PUBLIC + COOKIE)
  const feed = await getPublicFeed({
    cookie: cookieHeader,
  });

  // 3️⃣ Load user (FAIL-SOFT)
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
    },
  };
};

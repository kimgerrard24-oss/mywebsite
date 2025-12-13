// ==============================
// file: pages/feed.tsx
// ==============================

import Head from "next/head";
import { GetServerSideProps } from "next";
import { api } from "@/lib/api/api";
import { useRouter } from "next/router";
import { useCallback } from "react";
import Link from "next/link";

type FeedProps = {
  user: any | null;
};

export default function FeedPage({ user }: FeedProps) {
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

          {MOCK_POSTS.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      </main>
    </>
  );
}

type Post = {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  image?: string;
  timestamp: string;
};

function PostCard({ post }: { post: Post }) {
  return (
    <article
      className="bg-white shadow-sm border rounded-2xl p-5 flex flex-col gap-4"
      aria-label="Post"
    >
      <header className="flex items-center gap-4">
        <img
          src={post.user.avatar}
          alt={post.user.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold text-lg">{post.user.name}</h3>
          <time className="text-gray-500 text-sm">{post.timestamp}</time>
        </div>
      </header>

      <p className="text-gray-800 leading-relaxed">{post.content}</p>

      {post.image && (
        <figure>
          <img
            src={post.image}
            alt="Post media"
            className="w-full rounded-xl object-cover max-h-[450px]"
          />
        </figure>
      )}

      <footer className="flex items-center justify-between pt-2">
        <button className="text-gray-600 hover:text-blue-600 font-medium transition">
          ถูกใจ
        </button>
        <button className="text-gray-600 hover:text-blue-600 font-medium transition">
          แสดงความคิดเห็น
        </button>
      </footer>
    </article>
  );
}

const MOCK_POSTS: Post[] = [
  {
    id: 1,
    user: {
      name: "Sophia Ch.",
      avatar: "/images/default-avatar.png",
    },
    content: "เริ่มต้นวันใหม่กับโปรเจกต์ PhlyPhant",
    image: "/images/social-hero.svg",
    timestamp: "1 ชั่วโมงที่ผ่านมา",
  },
  {
    id: 2,
    user: {
      name: "Michael T.",
      avatar: "/images/default-avatar.png",
    },
    content: "วันนี้อากาศดีมากครับ ออกไปเดินเล่นกันไหม",
    timestamp: "3 ชั่วโมงที่ผ่านมา",
  },
];

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookieHeader = ctx.req.headers.cookie ?? undefined;

  const baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "https://api.phlyphant.com";

  const apiBase = baseUrl.replace(/\/+$/, "");

  // 1) Check session validity first (lightweight & stable)
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

  // 2) Session valid → fetch user profile
  const userRes = await fetch(`${apiBase}/users/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!userRes.ok) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const json = await userRes.json().catch(() => null);

  let user = null;
  if (json?.data && typeof json.data === "object") {
    user = json.data;
  } else if (json?.id) {
    user = json;
  }

  return {
    props: {
      user,
    },
  };
};

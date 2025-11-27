// ==============================
// file: pages/feed.tsx
// Social Feed Page (SEO + Responsive + TailwindCSS)
// ==============================

import Head from "next/head";
import { GetServerSideProps } from "next";
import { validateSessionOnServer } from "@/lib/auth";
import LogoutButton from "@/components/auth/LogoutButton";

type FeedProps = {
  valid: boolean;
  user: any | null;
};

export default function FeedPage({ valid, user }: FeedProps) {
  // ถ้าไม่ได้ล็อกอิน → redirect ที่ server-side แล้ว (SSR)
  // มาถึงตรงนี้คือ "มี session แล้ว" เท่านั้น

  return (
    <>
      {/* SEO */}
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

      {/* Main Layout */}
      <main className="min-h-screen bg-gray-50 text-gray-900">
        {/* Top Navigation */}
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

              <img
                src={user?.picture || "/images/default-avatar.png"}
                className="w-10 h-10 rounded-full border object-cover"
                alt="Avatar"
              />

              <LogoutButton />
            </div>
          </nav>
        </header>

        {/* Feed Wrapper */}
        <section
          className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6"
          aria-label="User feed"
        >
          {/* Welcome Box */}
          <article className="bg-white p-6 rounded-2xl shadow border">
            <h2 className="text-xl font-semibold">
              สวัสดี {user?.name || user?.email || "ผู้ใช้"} 👋
            </h2>
            <p className="text-gray-600 mt-1">
              ดูโพสต์ล่าสุดจากชุมชนของคุณบน PhlyPhant
            </p>
          </article>

          {/* ======================================
              MOCKED FEED ITEM (คุณโหลดจริงที่หลังได้)
             ====================================== */}
          {MOCK_POSTS.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      </main>
    </>
  );
}

// =============================
// Semantic Post Card Component
// =============================

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
      {/* User Header */}
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

      {/* Content */}
      <p className="text-gray-800 leading-relaxed">{post.content}</p>

      {/* Image (optional) */}
      {post.image && (
        <figure>
          <img
            src={post.image}
            alt="Post media"
            className="w-full rounded-xl object-cover max-h-[450px]"
          />
        </figure>
      )}

      {/* Actions */}
      <footer className="flex items-center justify-between pt-2">
        <button className="text-gray-600 hover:text-blue-600 font-medium transition">
          ❤️ ถูกใจ
        </button>
        <button className="text-gray-600 hover:text-blue-600 font-medium transition">
          💬 แสดงความคิดเห็น
        </button>
      </footer>
    </article>
  );
}

// ===============================
// Mock Data (ภายหลังเปลี่ยนเป็น real API)
// ===============================

const MOCK_POSTS: Post[] = [
  {
    id: 1,
    user: {
      name: "Sophia Ch.",
      avatar: "/images/default-avatar.png",
    },
    content: "เริ่มต้นวันใหม่กับโปรเจกต์ PhlyPhant 🚀✨",
    image: "/images/social-hero.svg",
    timestamp: "1 ชั่วโมงที่ผ่านมา",
  },
  {
    id: 2,
    user: {
      name: "Michael T.",
      avatar: "/images/default-avatar.png",
    },
    content: "วันนี้อากาศดีมากครับ ☀️ ออกไปเดินเล่นกันไหม?",
    timestamp: "3 ชั่วโมงที่ผ่านมา",
  },
];

// =============================
// Server-Side Session Protection
// =============================

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookieHeader = ctx.req.headers.cookie;

  const result = await validateSessionOnServer(cookieHeader);

  // ไม่มี session → redirect
  if (!result || !result.valid) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const data = result as Record<string, any>;
  const user = data.user ?? null;

  return {
    props: {
      valid: true,
      user,
    },
  };
};

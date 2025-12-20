// frontend/pages/users/[userId].tsx
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

import ProfileLayout from "@/components/layout/ProfileLayout";
import { ProfileCard } from "@/components/profile/profile-ProfileCard";

import { fetchPublicUserProfileServer } from "@/lib/api/user";
import { getUserPosts } from "@/lib/api/posts";

import FeedItem from "@/components/feed/FeedItem";

import type { PublicUserProfile } from "@/lib/api/user";
import type { PostFeedItem } from "@/types/post-feed";

type Props = {
  profile: PublicUserProfile;
  posts: PostFeedItem[];
};

export default function UserProfilePage({ profile, posts }: Props) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.phlyphant.com";

  return (
    <>
      <Head>
        <title>
          {profile.displayName ?? "User"} | PhlyPhant
        </title>
        <meta
          name="description"
          content={`ดูโปรไฟล์และโพสต์ของ ${
            profile.displayName ?? "ผู้ใช้"
          } บน PhlyPhant`}
        />
        <link
          rel="canonical"
          href={`${siteUrl}/users/${profile.id}`}
        />
        <meta property="og:type" content="profile" />
        <meta
          property="og:title"
          content={`${profile.displayName ?? "User"} | PhlyPhant`}
        />
        <meta
          property="og:url"
          content={`${siteUrl}/users/${profile.id}`}
        />
      </Head>

      <ProfileLayout>
        <main className="min-h-screen bg-gray-50">
          {/* ===== Top navigation (same UX as owner profile) ===== */}
          <div className="max-w-5xl mx-auto px-4 pt-4">
            <Link
              href="/feed"
              prefetch={false}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to feed
            </Link>
          </div>

          {/* ===== Profile card (read-only) ===== */}
          <div className="mx-auto max-w-5xl px-4 pt-4 pb-8">
            <ProfileCard
              profile={{
                ...profile,
                // 🔒 force read-only behavior
                isSelf: false,
              }}
            />
          </div>

          {/* ===== User posts ===== */}
          <section className="mx-auto max-w-5xl px-4 pb-12">
            <h2 className="mb-4 text-lg font-semibold">
              Posts
            </h2>

            {posts.length === 0 ? (
              <p className="text-sm text-gray-500">
                No posts to display
              </p>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <FeedItem key={post.id} post={post} />
                ))}
              </div>
            )}
          </section>
        </main>
      </ProfileLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const userId = ctx.params?.userId;

  // guard
  if (typeof userId !== "string") {
    return { notFound: true };
  }

  try {
    // ===== Public profile (SSR) =====
    const { profile } = await fetchPublicUserProfileServer(
      userId,
      ctx.req.headers.cookie
    );

    if (!profile) {
      return { notFound: true };
    }

    // ===== User posts (fail-soft) =====
    let posts: PostFeedItem[] = [];

    try {
      const feed = await getUserPosts({
        userId,
        limit: 20,
      });

      posts = feed.items;
    } catch {
      // intentional fail-soft
    }

    return {
      props: {
        profile,
        posts,
      },
    };
  } catch {
    return { notFound: true };
  }
};

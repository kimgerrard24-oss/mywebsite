// frontend/pages/users/[userId].tsx
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

import ProfileLayout from "@/components/layout/ProfileLayout";
import { ProfileCard } from "@/components/profile/profile-ProfileCard";

import ProfilePosts from "@/components/profile/ProfilePosts";

import { fetchPublicUserProfileServer } from "@/lib/api/user";
import { getUserPosts } from "@/lib/api/posts";

import type { PublicUserProfile } from "@/lib/api/user";
import type { PostFeedItem } from "@/types/post-feed";

type Props = {
  profile: PublicUserProfile;
  posts: PostFeedItem[]; // kept for compatibility (fail-soft SSR)
};

export default function UserProfilePage({ profile }: Props) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.phlyphant.com";

  return (
    <>
      <Head>
        <title>{profile.displayName ?? "User"} | PhlyPhant</title>
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
          {/* ===== Top navigation ===== */}
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
              profile={profile}
              isSelf={false}
            />
          </div>

          {/* ===== Shared ProfilePosts (same as /profile) ===== */}
          <div className="mx-auto max-w-5xl px-4 pb-12">
            <ProfilePosts userId={profile.id} />
          </div>
        </main>
      </ProfileLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const userId = ctx.params?.userId;

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

    // ===== User posts (SSR, fail-soft, kept for compatibility) =====
    let posts: PostFeedItem[] = [];

    try {
      const feed = await getUserPosts({
        userId,
        limit: 20,
        cookie: ctx.req.headers.cookie,
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

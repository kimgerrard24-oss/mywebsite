// frontend/pages/users/[userId].tsx
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

import ProfileLayout from "@/components/layout/ProfileLayout";
import { ProfileCard } from "@/components/profile/profile-ProfileCard";
import ProfilePosts from "@/components/profile/ProfilePosts";

import { fetchPublicUserProfileServer } from "@/lib/api/user";
import { getUserPosts } from "@/lib/api/posts";
import BlockUserButton from "@/components/users/BlockUserButton";
import UnblockUserButton from "@/components/users/UnblockUserButton";

import type { PublicUserProfile } from "@/types/user-profile";
import type { PostFeedItem } from "@/types/post-feed";

type Props = {
  profile: PublicUserProfile;
  posts: PostFeedItem[];
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
          <nav
            aria-label="Profile navigation"
            className="
              mx-auto
              w-full
              max-w-5xl
              px-4
              pt-4
              sm:pt-6
            "
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

          {/* ===== Profile card ===== */}
<section
  aria-label="User profile"
  className="
    mx-auto
    w-full
    max-w-5xl
    px-4
    pt-4
    sm:pt-6
    pb-6
    sm:pb-8
  "
>
  {/* ⬇️ wrapper now fits card width */}
  <div className="relative w-fit mx-auto">
    <ProfileCard
      profile={profile}
      isSelf={profile.isSelf === true}
    />

    {/* ===== Block / Unblock (inside card) ===== */}
    {!profile.isSelf && (
      <div className="absolute right-4 top-[5.5rem] sm:top-[6.5rem]">
        {profile.isBlocked ? (
          <UnblockUserButton
            targetUserId={profile.id}
            onUnblocked={() => window.location.reload()}
          />
        ) : (
          <BlockUserButton
            targetUserId={profile.id}
            onBlocked={() => window.location.reload()}
          />
        )}
      </div>
    )}
  </div>
</section>


          {/* ===== Profile posts ===== */}
          <section
            aria-label="User posts"
            className="
              mx-auto
              w-full
              max-w-5xl
              px-4
              pb-8
              sm:pb-12
            "
          >
            <ProfilePosts userId={profile.id} />
          </section>
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
    const { profile } =
      await fetchPublicUserProfileServer(
        userId,
        ctx.req.headers.cookie
      );

    if (!profile) {
      return { notFound: true };
    }

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



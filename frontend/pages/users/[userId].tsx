// frontend/pages/users/[userId].tsx
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

import ProfileLayout from "@/components/layout/ProfileLayout";
import { ProfileCard } from "@/components/profile/profile-ProfileCard";
import ProfilePosts from "@/components/profile/ProfilePosts";

import { fetchPublicUserProfileServer } from "@/lib/api/user";
import { getUserPosts } from "@/lib/api/posts";

import type { PublicUserProfile } from "@/types/user-profile";
import type { PostFeedItem } from "@/types/post-feed";
import { useCurrentProfileMedia } from "@/hooks/useCurrentProfileMedia";
import { ProfileUpdateStoreProvider } from "@/stores/profile-update.store";
import { CoverUpdateStoreProvider } from "@/stores/cover-update.store";
import ProfileUpdateModal from "@/components/profile/ProfileUpdateModal";
import CoverUpdateModal from "@/components/profile/CoverUpdateModal";

type Props = {
  profile: PublicUserProfile;
  posts: PostFeedItem[];
};

export default function UserProfilePage({ profile }: Props) {
  const currentMedia = useCurrentProfileMedia(profile.id);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.phlyphant.com";

  return (
    <ProfileUpdateStoreProvider>
    <CoverUpdateStoreProvider>
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
            <div className="relative">
<ProfileCard
  profile={profile}
  isSelf={profile.isSelf === true}
/>

  {/* 🔥 IMPORTANT: mount modal here */}
    {profile.isSelf && (
      <>
        <ProfileUpdateModal currentMedia={currentMedia} />
        <CoverUpdateModal currentMedia={currentMedia} />
      </>
    )}

            </div>
          </section>

          {/* ===== Profile posts ===== */}
{profile.canViewContent ? (
  <section className="mx-auto max-w-5xl px-4 pb-12">
    <ProfilePosts userId={profile.id} />
  </section>
) : (
  !profile.isSelf && (
    <section className="mx-auto max-w-5xl px-4 pb-12 text-sm text-gray-500">
      This account is private. Follow to see their posts.
    </section>
  )
)}


        </main>
      </ProfileLayout>
    </>
    </CoverUpdateStoreProvider>
  </ProfileUpdateStoreProvider>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const userId = ctx.params?.userId;

  // ===== invalid route param =====
  if (typeof userId !== "string") {
    return { notFound: true };
  }

  try {
    const { profile } =
      await fetchPublicUserProfileServer(
        userId,
        ctx.req.headers.cookie
      );

    /**
     * ==================================================
     * 🚨 VIEWER CANNOT SEE PROFILE (blocked / private / revoked)
     * → redirect to feed (better UX than 404)
     * ==================================================
     */
    if (!profile) {
      return {
        redirect: {
          destination: "/feed",
          permanent: false,
        },
      };
    }

    let posts: PostFeedItem[] = [];

    /**
     * ==================================================
     * ✅ Load posts only if viewer can see content
     * (backend already enforced authority)
     * ==================================================
     */
    if (profile.canViewContent === true) {
      try {
        const feed = await getUserPosts({
          userId,
          limit: 20,
          cookie: ctx.req.headers.cookie,
        });

        posts = feed.items;
      } catch {
        // fail-soft: profile still renders even if posts fail
      }
    }

    return {
      props: {
        profile,
        posts,
      },
    };
  } catch {
    /**
     * ==================================================
     * 🚨 API / NETWORK ERROR
     * keep as 404 to avoid leaking state
     * ==================================================
     */
    return { notFound: true };
  }
};





// frontend/pages/users/[userId].tsx
import { GetServerSideProps } from "next";
import ProfileLayout from "@/components/layout/ProfileLayout";
import ProfileMeta from "@/components/seo/ProfileMeta";
import PublicUserProfile from "@/components/profile/PublicUserProfile";
import { fetchPublicUserProfileServer } from "@/lib/api/user";

// ===== NEW =====
import { getUserPosts } from "@/lib/api/posts";
import FeedItem from "@/components/feed/FeedItem";
// ==============

import type { PublicUserProfile as PublicUserProfileType } from "@/lib/api/user";
import type { PostFeedItem } from "@/types/post-feed";

type Props = {
  profile: PublicUserProfileType;

  // ===== NEW =====
  posts: PostFeedItem[];
  // ==============
};

export default function UserProfilePage({ profile, posts }: Props) {
  return (
    <>
      <ProfileMeta profile={profile} />
      <ProfileLayout>
        <main>
          {/* ===== Existing profile (DO NOT TOUCH) ===== */}
          <PublicUserProfile profile={profile} />

          {/* ===== New: User posts feed ===== */}
          <section className="mt-6">
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

  // guard: userId ต้องเป็น string เท่านั้น
  if (typeof userId !== "string") {
    return { notFound: true };
  }

  try {
    // ===== Existing: fetch public profile =====
    const { profile } = await fetchPublicUserProfileServer(
      userId,
      ctx.req.headers.cookie
    );

    if (!profile) {
      return { notFound: true };
    }

    // ===== New: fetch user posts (fail-soft) =====
    let posts: PostFeedItem[] = [];

    try {
      const feed = await getUserPosts({
        userId,
        limit: 20,
      });

      posts = feed.items;
    } catch {
      // fail-soft: profile ยังต้องแสดง
    }

    return {
      props: {
        profile,
        posts,
      },
    };
  } catch {
    // fail-soft: backend error / network error
    return { notFound: true };
  }
};

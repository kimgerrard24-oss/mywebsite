// frontend/pages/moderation/posts/[id].tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import Link from "next/link";

import ProfileLayout from "@/components/layout/ProfileLayout";
import PostDetail from "@/components/posts/PostDetail";
import ModerationBanner from "@/components/moderation/ModerationBanner";
import AppealButton from "@/components/appeals/AppealButton";

import { requireSessionSSR } from "@/lib/auth/require-session-ssr";
import { getMyModeratedPostSSR } from "@/lib/api/moderation";

import type { ModeratedPostDetail } from "@/types/moderation";

type Props = ModeratedPostDetail;

export default function ModeratedPostPage({
  post,
  moderation,
  canAppeal,
}: Props) {
  if (!post || !moderation) {
    return (
      <ProfileLayout>
        <main className="mx-auto max-w-3xl p-6">
          <p className="text-sm text-gray-600">
            Content not found or unavailable.
          </p>
          <Link
            href="/feed"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to feed
          </Link>
        </main>
      </ProfileLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Post under moderation | PhlyPhant</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <ProfileLayout>
        <main className="min-h-screen bg-gray-50">
          {/* Back */}
          <nav
            aria-label="Navigation"
            className="mx-auto max-w-5xl px-4 pt-4"
          >
            <Link
              href="/feed"
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to feed
            </Link>
          </nav>

          {/* Moderation */}
          <section className="mx-auto max-w-5xl px-4 pt-4">
            <ModerationBanner
              actionType={moderation.actionType}
              reason={moderation.reason}
              createdAt={moderation.createdAt}
            />

            {canAppeal && (
              <div className="pt-3">
                <AppealButton
                  targetType="POST"
                  targetId={post.id}
                  canAppeal={canAppeal}
                />
              </div>
            )}
          </section>

          {/* Post preview */}
          <section
            aria-label="Post preview"
            className="mx-auto max-w-5xl px-4 pt-6 pb-10"
          >
            {/* PostDetail expects normal PostDetail type,
                but this is moderation preview — cast is acceptable */}
            <PostDetail post={post as any} />
          </section>
        </main>
      </ProfileLayout>
    </>
  );
}

/* ================= SSR ================= */

export const getServerSideProps: GetServerSideProps<Props> =
  async (ctx) => {
    const postId = ctx.params?.id;

    if (typeof postId !== "string") {
      return { notFound: true };
    }

    // 🔐 UX guard only — backend is still authority
    const session = await requireSessionSSR(ctx);

if (!session) {
  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
}


    try {
      const data = await getMyModeratedPostSSR(
        postId,
        ctx, // ✅ pass ctx, not cookie string
      );

      if (!data) return { notFound: true };

      return { props: data };
    } catch {
      return { notFound: true };
    }
  };


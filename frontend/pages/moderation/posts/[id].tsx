// frontend/pages/moderation/posts/[id].tsx

import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import ProfileLayout from '@/components/layout/ProfileLayout';
import PostDetail from '@/components/posts/PostDetail';

import AppealButton from '@/components/appeals/AppealButton';
import { sessionCheckServerSide } from '@/lib/api/api';
import { getModeratedPostDetail } from '@/lib/api/admin-moderation';

import type { PostDetail as PostDetailType } from '@/types/post-detail';

type Props = {
  post: PostDetailType | null;
  moderation: {
    actionType: string;
    reason?: string | null;
    createdAt: string;
  } | null;
  canAppeal: boolean;
};

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
          {/* ===== Back nav ===== */}
          <nav
            aria-label="Navigation"
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
              className="
                inline-block
                text-xs
                sm:text-sm
                text-blue-600
                hover:underline
              "
            >
              ← Back to feed
            </Link>
          </nav>

          {/* ===== Moderation banner ===== */}
          <section
            className="
              mx-auto
              w-full
              max-w-5xl
              px-4
              pt-4
              sm:pt-6
            "
          >
            <div
              className="
                rounded-lg
                border
                border-red-200
                bg-red-50
                p-4
                space-y-2
              "
              role="alert"
            >
              <p className="text-sm font-medium text-red-700">
                This post has been moderated by admin
              </p>

              <p className="text-xs text-red-700">
                Action: {moderation.actionType}
              </p>

              {moderation.reason && (
                <p className="text-xs text-red-700">
                  Reason: {moderation.reason}
                </p>
              )}

              <p className="text-xs text-gray-600">
                {new Date(
                  moderation.createdAt,
                ).toLocaleString()}
              </p>

              {canAppeal && (
                <div className="pt-2">
                  <AppealButton
                    targetType="POST"
                    targetId={post.id}
                    canAppeal={canAppeal}
                  />
                </div>
              )}
            </div>
          </section>

          {/* ===== Post preview ===== */}
          <section
            aria-label="Post preview"
            className="
              mx-auto
              w-full
              max-w-5xl
              px-4
              pt-6
              pb-10
            "
          >
            <PostDetail post={post} />
          </section>
        </main>
      </ProfileLayout>
    </>
  );
}

/* ================= SSR ================= */

export const getServerSideProps: GetServerSideProps<
  Props
> = async (ctx) => {
  const cookieHeader =
    ctx.req.headers.cookie ?? '';

  // 🔐 session check (backend authority)
  const session = await sessionCheckServerSide(
    cookieHeader,
  );

  if (!session.valid) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const postId = String(ctx.params?.id ?? '');

  if (!postId) {
    return { notFound: true };
  }

  try {
    const data = await getModeratedPostDetail({
      postId,
      cookieHeader, // ✅ แก้ตรงนี้
    });

    return {
      props: {
        post: data.post ?? null,
        moderation: data.moderation ?? null,
        canAppeal: data.canAppeal === true,
      },
    };
  } catch {
    return { notFound: true };
  }
};

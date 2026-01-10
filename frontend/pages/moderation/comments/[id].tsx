// frontend/pages/moderation/comments/[id].tsx

import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';

import ProfileLayout from '@/components/layout/ProfileLayout';
import ModerationBanner from '@/components/moderation/ModerationBanner';
import ModeratedCommentPreview from '@/components/comments/ModeratedCommentPreview';
import AppealButton from '@/components/appeals/AppealButton';
import {
  getMyModeratedCommentSSR,
} from '@/lib/api/moderation';

import type {
  ModeratedCommentDetail,
} from '@/types/moderation';
import { requireSessionSSR } from '@/lib/auth/require-session-ssr';

type Props = ModeratedCommentDetail;

export default function ModeratedCommentPage({
  comment,
  moderation,
  canAppeal,
}: Props) {
  if (!comment || !moderation) {
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
        <title>Comment under moderation | PhlyPhant</title>
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
              href={`/posts/${comment.postId}`}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to post
            </Link>
          </nav>

          {/* Moderation */}
          <section className="mx-auto max-w-5xl px-4 pt-4 space-y-3">
            <ModerationBanner
              actionType={moderation.actionType}
              reason={moderation.reason}
              createdAt={moderation.createdAt}
            />

            {canAppeal && (
              <AppealButton
                targetType="COMMENT"
                targetId={comment.id}
                canAppeal={canAppeal}
              />
            )}
          </section>

          {/* Comment preview */}
          <section
            aria-label="Comment preview"
            className="mx-auto max-w-5xl px-4 pt-6 pb-10"
          >
            <ModeratedCommentPreview
              content={comment.content}
              createdAt={comment.createdAt}
            />
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
  // 🔐 backend authority — redirect if invalid
  await requireSessionSSR(ctx);

  const commentId = String(ctx.params?.id ?? '');
  if (!commentId) return { notFound: true };

  try {
    const data = await getMyModeratedCommentSSR(
      commentId,
      ctx, 
    );

    return { props: data };
  } catch {
    return { notFound: true };
  }
};

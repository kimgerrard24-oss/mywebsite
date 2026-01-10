// frontend/pages/moderation/chat-message/[id].tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import Link from "next/link";

import ProfileLayout from "@/components/layout/ProfileLayout";
import ModerationBanner from "@/components/moderation/ModerationBanner";
import ModeratedMessagePreview from "@/components/moderation/ModeratedMessagePreview";
import AppealButton from "@/components/appeals/AppealButton";

import {
  getMyModeratedMessageSSR,
} from "@/lib/api/moderation";
import { requireSessionSSR } from "@/lib/auth/require-session-ssr";

import type { ModeratedMessageDetail } from "@/types/moderation";

type Props = {
  message: ModeratedMessageDetail;
  moderation: {
    actionType: string;
    reason?: string | null;
    createdAt: string;
  };
  canAppeal: boolean;
};

export default function ModeratedMessagePage({
  message,
  moderation,
  canAppeal,
}: Props) {
  if (!message || !moderation) {
  return (
    <ProfileLayout>
      <main className="mx-auto max-w-3xl p-6">
        <p className="text-sm text-gray-600">
          Content not found or unavailable.
        </p>
      </main>
    </ProfileLayout>
  );
}


  return (
    <>
      <Head>
        <title>Message under moderation | PhlyPhant</title>
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
          <section className="mx-auto max-w-5xl px-4 pt-4 space-y-3">
            <ModerationBanner
              actionType={moderation.actionType}
              reason={moderation.reason}
              createdAt={moderation.createdAt}
            />

            {canAppeal && (
              <AppealButton
                targetType="CHAT_MESSAGE"
                targetId={message.id}
                canAppeal={canAppeal}
              />
            )}
          </section>

          {/* Message preview */}
          <section
            aria-label="Message preview"
            className="mx-auto max-w-5xl px-4 pt-6 pb-10"
          >
            <ModeratedMessagePreview message={message} />
          </section>
        </main>
      </ProfileLayout>
    </>
  );
}

/* ================= SSR ================= */

export const getServerSideProps: GetServerSideProps<Props> =
  async (ctx) => {
    // 🔐 backend authority — redirect if invalid
    await requireSessionSSR(ctx);

    const id = String(ctx.params?.id ?? "");
    if (!id) return { notFound: true };

    try {
      const data = await getMyModeratedMessageSSR(
        id,
        ctx,
      );

      return { props: data };
    } catch {
      return { notFound: true };
    }
  };

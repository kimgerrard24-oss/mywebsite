// frontend/pages/moderation/chat-message/[id].tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import Link from "next/link";

import ProfileLayout from "@/components/layout/ProfileLayout";
import ModeratedMessagePreview from "@/components/moderation/ModeratedMessagePreview";
import AppealActionPanel from "@/components/moderation/AppealActionPanel";

import { getModeratedMessage } from "@/lib/api/moderation";
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
  canAppeal,
  moderation,
}: Props) {
  if (!message || !moderation) {
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
        <title>Message under moderation | PhlyPhant</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <ProfileLayout>
        <main className="min-h-screen bg-gray-50">
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

          <section className="mx-auto max-w-5xl px-4 pt-4 space-y-3">
  <AppealActionPanel
    messageId={message.id}
    canAppeal={canAppeal}
    moderation={moderation}
  />
</section>


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
    await requireSessionSSR(ctx);

    const id = String(ctx.params?.id ?? "");
    if (!id) return { notFound: true };

   try {
  const data = await getModeratedMessage(id, ctx);

  if (!data) return { notFound: true };

  // backend returns wrapper: { message, moderation, canAppeal }
  return {
    props: data as unknown as Props,
  };
} catch {
  return { notFound: true };
}

  };




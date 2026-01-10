// frontend/pages/moderation/chat-message/[id].tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";

import ModeratedMessagePreview from "@/components/moderation/ModeratedMessagePreview";
import AppealActionPanel from "@/components/moderation/AppealActionPanel";

import { getModeratedMessage } from "@/lib/api/moderation";
import { requireSessionSSR } from "@/lib/auth/require-session-ssr";

import type { ModeratedMessageDetail } from "@/types/moderation";

type Props = {
  message: ModeratedMessageDetail;
};

export default function ModeratedMessagePage({
  message,
}: Props) {
  return (
    <>
      <Head>
        <title>Moderation Notice | PhlyPhant</title>
        <meta
          name="robots"
          content="noindex,nofollow"
        />
      </Head>

      <main className="mx-auto max-w-md px-4 py-6 space-y-4">
        <ModeratedMessagePreview
          message={message}
        />

        <AppealActionPanel message={message} />
      </main>
    </>
  );
}

/* ================= SSR ================= */

export const getServerSideProps: GetServerSideProps<
  Props
> = async (ctx) => {
  const id = ctx.params?.id;

  if (typeof id !== "string") {
    return { notFound: true };
  }

  // 🔐 backend authority — will redirect if invalid
  await requireSessionSSR(ctx);

  try {
    const message = await getModeratedMessage(
      id,
      ctx,
    );

    if (!message) {
      return { notFound: true };
    }

    return { props: { message } };
  } catch {
    return { notFound: true };
  }
};


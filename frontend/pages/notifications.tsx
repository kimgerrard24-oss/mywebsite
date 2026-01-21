// frontend/pages/notifications.tsx

import Head from "next/head";
import type { GetServerSideProps } from "next";
import { useEffect, useMemo } from "react";

import NotificationList from "@/components/notifications/NotificationList";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationStore } from "@/stores/notification.store";
import type { NotificationItem } from "@/types/notification";

/* ============================
   PAGE
   ============================ */
export default function NotificationsPage() {
  const {
    items: fetchedItems,
    loading,
    error,
    loadMore,
    hasMore,
  } = useNotifications();

  // ===== store (single source of truth) =====
  const storeItems = useNotificationStore((s) => s.items);
  const hydrate = useNotificationStore((s) => s.hydrate);

  /**
   * Sync REST result → store
   * - backend = authority
   * - รองรับ realtime merge
   */
  useEffect(() => {
    if (fetchedItems.length > 0) {
      hydrate(fetchedItems);
    }
  }, [fetchedItems, hydrate]);

  /**
   * Narrow store items → UI domain type
   * - backend guarantees type correctness
   * - UI ต้อง strict
   */
  const items = useMemo(
    () => storeItems as NotificationItem[],
    [storeItems],
  );

  return (
    <>
      <Head>
        <title>Notifications | PhlyPhant</title>
        <meta
          name="description"
          content="Your latest notifications on PhlyPhant"
        />
        <meta name="robots" content="noindex" />
      </Head>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <section aria-labelledby="notifications-heading">
          <h1
            id="notifications-heading"
            className="text-xl font-semibold mb-4"
          >
            Notifications
          </h1>

          {error && (
            <p className="text-sm text-red-600 mb-2">
              {error}
            </p>
          )}

          <NotificationList items={items} />

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loading}
              className="
                mt-4
                text-sm
                text-blue-600
                hover:underline
              "
            >
              {loading ? "Loading..." : "Load more"}
            </button>
          )}
        </section>
      </main>
    </>
  );
}

/* ============================
   SSR AUTH (BACKEND AUTHORITY)
   ============================ */
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookieHeader = ctx.req.headers.cookie;

  if (!cookieHeader) {
    return {
      redirect: {
        destination: "/feed",
        permanent: false,
      },
    };
  }

  const base =
    process.env.INTERNAL_BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "https://api.phlyphant.com";

  // 🔐 session-check (authority)
  const sessionRes = await fetch(`${base}/auth/session-check`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!sessionRes.ok) {
    return {
      redirect: {
        destination: "/feed",
        permanent: false,
      },
    };
  }

  const session = await sessionRes.json().catch(() => null);

  if (!session || session.valid !== true) {
    return {
      redirect: {
        destination: "/feed",
        permanent: false,
      },
    };
  }

  // ✅ allow render
  return { props: {} };
};

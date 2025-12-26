// frontend/pages/notifications.tsx
import Head from 'next/head';
import NotificationList from '@/components/notifications/NotificationList';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationsPage() {
  const {
    items,
    loading,
    error,
    loadMore,
    hasMore,
  } = useNotifications();

  return (
    <>
      <Head>
        <title>Notifications | PhlyPhant</title>
        <meta
          name="description"
          content="Your latest notifications on PhlyPhant"
        />
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
              {loading ? 'Loading...' : 'Load more'}
            </button>
          )}
        </section>
      </main>
    </>
  );
}

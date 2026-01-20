// frontend/pages/requests.tsx

import Head from 'next/head';
import IncomingFollowRequestList from '@/components/follows/IncomingFollowRequestList';
import { useNotificationSocket } from '@/lib/notification.socket';

export default function FollowRequestsPage() {
  useNotificationSocket();

  return (
    <>
      <Head>
        <title>
          Follow Requests – PhlyPhant
        </title>
        <meta
          name="robots"
          content="noindex"
        />
      </Head>

      <main className="mx-auto max-w-xl">
        <IncomingFollowRequestList />
      </main>
    </>
  );
}

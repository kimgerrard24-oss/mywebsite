// frontend/pages/chat/index.tsx
import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import { requireSessionSSR } from '@/lib/auth/require-session-ssr';
import { getChatRooms } from '@/lib/api/chat';
import ChatLayout from '@/components/chat/ChatLayout';
import ChatRoomList from '@/components/chat/ChatRoomList';
import ChatRoomEmptyState from '@/components/chat/ChatRoomEmptyState';

type ChatRoom = {
  id: string;
  peer: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
  lastMessage: {
    content: string;
    createdAt: string;
  } | null;
  unreadCount: number;
};

type Props = {
  rooms: ChatRoom[];
};

export default function ChatRoomsPage({ rooms }: Props) {
  return (
    <>
      <Head>
        <title>Chats | PhlyPhant</title>
        <meta
          name="description"
          content="Your private conversations on PhlyPhant"
        />
      </Head>

      <ChatLayout>
        {rooms.length === 0 ? (
          <ChatRoomEmptyState />
        ) : (
          <ChatRoomList rooms={rooms} />
        )}
      </ChatLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps =
  async (ctx) => {
    const redirect = await requireSessionSSR(ctx);
    if (redirect) return redirect;

    try {
      const rooms = await getChatRooms({
        cookie: ctx.req.headers.cookie ?? '',
      });

      return {
        props: { rooms },
      };
    } catch {
      return {
        props: { rooms: [] },
      };
    }
  };

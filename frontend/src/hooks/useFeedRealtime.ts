// frontend/src/hooks/useFeedRealtime.ts

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useFeedStore } from '@/stores/feed.store';

type FeedNewPostPayload = {
  postId: string;
  authorId: string;
};

type FeedInvalidatePayload = {
  reason: 'new-post' | 'privacy-change';
};

export function useFeedRealtime() {
  const invalidate =
    useFeedStore((s) => s.invalidate);

  useEffect(() => {
    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const onNewPost = (
      _payload: FeedNewPostPayload,
    ) => {
      /**
       * ไม่ insert post
       * แค่บอกว่า feed ควรถูก refresh
       */
      invalidate('new-post');
    };

    const onInvalidate = (
      payload: FeedInvalidatePayload,
    ) => {
      invalidate(payload.reason);
    };

    socket.on('feed:new-post', onNewPost);
    socket.on(
      'feed:invalidate',
      onInvalidate,
    );

    return () => {
      socket.off(
        'feed:new-post',
        onNewPost,
      );
      socket.off(
        'feed:invalidate',
        onInvalidate,
      );
    };
  }, [invalidate]);
}

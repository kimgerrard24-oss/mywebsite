// frontend/src/stores/notification.store.ts

import { create } from 'zustand';

export type NotificationItem = {
  id: string;
  type: string;
  actor: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: string;
};

type NotificationState = {
  items: NotificationItem[];
  unreadCount: number;

  /**
   * realtime insert
   */
  pushNotification: (item: NotificationItem) => void;

  /**
   * optimistic read
   */
  markAsRead: (notificationId: string) => void;

  /**
   * hydrate from REST
   */
  hydrate: (items: NotificationItem[]) => void;
};

const MAX_ITEMS = 50;

export const useNotificationStore =
  create<NotificationState>((set) => ({
    items: [],
    unreadCount: 0,

    pushNotification: (item) =>
      set((state) => {
        const exists = state.items.some(
          (n) => n.id === item.id,
        );
        if (exists) return state;

        const nextItems = [
          item,
          ...state.items,
        ].slice(0, MAX_ITEMS);

        return {
          items: nextItems,
          unreadCount: state.unreadCount + 1,
        };
      }),

    markAsRead: (notificationId) =>
      set((state) => ({
        items: state.items.map((n) =>
          n.id === notificationId
            ? { ...n, isRead: true }
            : n,
        ),
        unreadCount: Math.max(
          0,
          state.unreadCount - 1,
        ),
      })),

    hydrate: (items) =>
      set(() => ({
        items,
        unreadCount: items.filter(
          (n) => !n.isRead,
        ).length,
      })),
  }));

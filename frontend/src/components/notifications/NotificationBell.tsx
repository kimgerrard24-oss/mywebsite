// frontend/src/components/notifications/NotificationBell.tsx

import { useEffect, useRef, useState, useMemo } from 'react';
import { getNotifications } from '@/lib/api/notifications';
import NotificationList from './NotificationList';
import { useNotificationStore } from '@/stores/notification.store';
import type { NotificationItem } from '@/types/notification';

/**
 * NotificationBell
 * - Entry point ของ Notification UI
 * - เรียก GET /notifications
 * - แสดง unread badge
 * - เปิด/ปิด dropdown
 */
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // ===== store (single source of truth) =====
  const storeItems = useNotificationStore((s) => s.items);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const hydrate = useNotificationStore((s) => s.hydrate);

  /**
   * Narrow store items → UI domain type
   * - backend guarantees valid notification.type
   * - UI ต้อง strict
   */
  const items = useMemo(
    () => storeItems as NotificationItem[],
    [storeItems],
  );

  // ===== load notifications เมื่อเปิด dropdown =====
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await getNotifications({ limit: 20 });
        if (!cancelled) {
          hydrate(res.items ?? []); // backend = authority
        }
      } catch {
        // fail-soft
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [open, hydrate]);

  // ===== click outside เพื่อปิด dropdown =====
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="
          relative
          inline-flex
          items-center
          justify-center
          rounded-full
          p-2
          hover:bg-gray-100
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      >
        <span aria-hidden="true" className="text-lg">
          🔔
        </span>

        {unreadCount > 0 && (
          <span
            aria-label={`${unreadCount} unread notifications`}
            className="
              absolute
              -top-1
              -right-1
              min-w-[18px]
              h-[18px]
              px-1
              flex
              items-center
              justify-center
              rounded-full
              bg-red-600
              text-[10px]
              font-semibold
              text-white
            "
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section
          role="dialog"
          aria-label="Notifications panel"
          className="
            absolute
            right-0
            z-50
            mt-2
            w-[90vw]
            max-w-sm
            rounded-lg
            border
            border-gray-200
            bg-white
            shadow-lg
            sm:w-80
          "
        >
          <header className="border-b px-3 py-2">
            <h2 className="text-sm font-semibold text-gray-800">
              Notifications
            </h2>
          </header>

          <div
            className="max-h-[60vh] overflow-y-auto"
            onClick={() => setOpen(false)}
          >
            {loading ? (
              <p className="p-3 text-sm text-gray-500">
                Loading notifications…
              </p>
            ) : (
              <NotificationList items={items} />
            )}
          </div>
        </section>
      )}
    </div>
  );
}

// frontend/src/components/notifications/NotificationBell.tsx

import { useEffect, useRef, useState } from 'react';
import { getNotifications } from '@/lib/api/notifications';
import type { NotificationItem } from '@/types/notification';
import NotificationList from './NotificationList';

/**
 * NotificationBell
 * - Entry point ของ Notification UI
 * - เรียก GET /notifications
 * - แสดง unread badge
 * - เปิด/ปิด dropdown
 */
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // ===== load notifications เมื่อเปิด dropdown =====
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await getNotifications({ limit: 20 });
        if (!cancelled) {
          setItems(res.items ?? []);
        }
      } catch {
        // fail-soft: แค่ไม่แสดง notification
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
  }, [open]);

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

  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      {/* ===== Bell Button ===== */}
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
        {/* 🔔 Icon */}
        <span aria-hidden="true" className="text-lg">
          🔔
        </span>

        {/* 🔴 Unread badge */}
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

      {/* ===== Dropdown ===== */}
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

          <div className="max-h-[60vh] overflow-y-auto">
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

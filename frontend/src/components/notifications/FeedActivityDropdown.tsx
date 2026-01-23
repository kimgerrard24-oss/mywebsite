// frontend/src/components/feed/FeedActivityDropdown.tsx

import { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import NotificationList from '@/components/notifications/NotificationList';
import { useNotificationStore } from '@/stores/notification.store';

/**
 * FeedActivityDropdown
 * - Activity feed from following (new posts)
 * - Uses SAME notification store
 * - Filter by type = feed_new_post
 * - Does NOT affect bell notifications
 *
 * UX Enhancements:
 * - keyboard accessible
 * - focus management
 * - aria roles
 * - subtle animations
 * - empty state guidance
 * - better click targets
 */
export default function FeedActivityDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // ===== source of truth: same notification store =====
  const storeItems = useNotificationStore((s) => s.items);

  // ===== derived feed items =====
  const items = useMemo(
    () => storeItems.filter((n) => n.type === 'feed_new_post'),
    [storeItems],
  );

  const unreadFeedCount = useMemo(
    () => items.filter((n) => !n.isRead).length,
    [items],
  );
  
  const router = useRouter();

useEffect(() => {
  const handleRoute = () => setOpen(false);
  router.events.on('routeChangeStart', handleRoute);
  return () => {
    router.events.off('routeChangeStart', handleRoute);
  };
}, [router.events]);
  // ===== toggle =====
  function handleToggle() {
    setOpen((prev) => !prev);
  }

  // ===== close on outside click =====
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

  // ===== close on ESC =====
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKey);
    }

    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

 return (
  <div ref={containerRef} className="relative">
    {/* ================= Trigger Button ================= */}
    <button
      ref={buttonRef}
      type="button"
      aria-label="Feed activity"
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={handleToggle}
      className="
        relative
        inline-flex
        items-center
        justify-center
        rounded-full
        p-2
        transition
        hover:bg-gray-100
        active:scale-95
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
      "
    >
      <span aria-hidden="true" className="text-lg leading-none">
        📰
      </span>

      {unreadFeedCount > 0 && (
        <span
          aria-label={`${unreadFeedCount} new feed updates`}
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
            bg-blue-600
            text-[10px]
            font-semibold
            text-white
            shadow
          "
        >
          {unreadFeedCount > 9 ? '9+' : unreadFeedCount}
        </span>
      )}
    </button>

    {/* ================= Dropdown ================= */}
    {open && (
      <section
        role="dialog"
        aria-label="Feed activity panel"
        aria-modal="false"
        className="
          absolute
          left-0
          z-50
          mt-3
          w-80
          max-w-[calc(100vw-1rem)]
          origin-top-left
          rounded-xl
          border
          border-gray-200
          bg-white
          shadow-xl
          focus:outline-none
        "
      >
        {/* ===== Popover Arrow ===== */}
        <div
          aria-hidden="true"
          className="
            absolute
            -top-2
            left-4
            h-4
            w-4
            rotate-45
            bg-white
            border-l
            border-t
            border-gray-200
          "
        />

        {/* ===== Header ===== */}
        <header
          className="
            flex
            items-center
            justify-between
            border-b
            px-3
            py-2
          "
        >
          <h2 className="text-sm font-semibold text-gray-800">
            New posts from people you follow
          </h2>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close feed activity"
            className="
              rounded
              px-2
              py-1
              text-xs
              text-gray-500
              hover:bg-gray-100
              hover:text-gray-700
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          >
            ✕
          </button>
        </header>

        {/* ===== Content ===== */}
        <div
          className="
            max-h-[60vh]
            overflow-y-auto
            overscroll-contain
          "
        >
          {items.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              <p className="mb-1">No new posts yet</p>
              <p className="text-xs text-gray-400">
                New updates from people you follow will appear here
              </p>
            </div>
          ) : (
            <NotificationList items={items} />
          )}
        </div>
      </section>
    )}
  </div>
);

}


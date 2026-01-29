// frontend/src/components/chat/ChatRoomPickerModal.tsx

// frontend/src/components/chat/ChatRoomPickerModal.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { api } from '@/lib/api/api';
import { useAuth } from '@/hooks/useAuth';

type ChatRoomItem = {
  id: string;
  isGroup: boolean;
  title: string | null;
  participants: {
    userId: string;
    user: {
      id: string;
      displayName: string | null;
      avatarUrl: string | null;
    };
  }[];
};

type Props = {
  postId: string;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function ChatRoomPickerModal({
  postId,
  onClose,
  onSuccess,
}: Props) {
  const { user } = useAuth();
  const viewerUserId = user?.id;

  const [rooms, setRooms] = useState<ChatRoomItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // =========================
  // ESC to close
  // =========================
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // =========================
  // Load chat rooms
  // =========================
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get<ChatRoomItem[]>(
          '/chat/rooms',
          { withCredentials: true },
        );

        if (!mounted) return;
        setRooms(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error('[ChatRoomPickerModal] load rooms failed', e);
        if (!mounted) return;
        setError('Unable to load chat rooms');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================
  // Share confirm
  // =========================
  async function handleConfirm() {
    if (!selectedId || sending) return;

    try {
      setSending(true);
      setError(null);

      await api.post(
        '/shares',
        {
          postId,
          targetChatId: selectedId,
        },
        { withCredentials: true },
      );

      onSuccess?.();
    } catch (e) {
      console.error('[ChatRoomPickerModal] share failed', e);
      setError('Unable to share to chat');
    } finally {
      setSending(false);
    }
  }

  // =========================
  // Helpers
  // =========================
  function getOtherParticipant(room: ChatRoomItem) {
    if (!viewerUserId) return null;

    return room.participants.find(
      (p) => p.user?.id && p.user.id !== viewerUserId,
    )?.user ?? null;
  }

  function getRoomTitle(room: ChatRoomItem) {
    if (room.isGroup) {
      return room.title || 'Group chat';
    }

    const other = getOtherParticipant(room);
    return other?.displayName || 'Direct message';
  }

  function getRoomAvatar(room: ChatRoomItem) {
    if (room.isGroup) return null;

    const other = getOtherParticipant(room);
    return other?.avatarUrl ?? null;
  }

  // =========================
  // Render
  // =========================
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Select chat room"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className="
          w-full max-w-md rounded-xl bg-white shadow-xl
          flex flex-col overflow-hidden
        "
      >
        {/* ===== Header ===== */}
        <header className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">
            Send to chat
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </header>

        {/* ===== List ===== */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {loading && (
            <p className="px-2 py-2 text-xs text-gray-500">
              Loading chats…
            </p>
          )}

          {!loading && error && (
            <p className="px-2 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && rooms.length === 0 && (
            <p className="px-2 py-2 text-xs text-gray-500">
              No chat rooms available
            </p>
          )}

          <ul className="flex flex-col gap-1">
            {rooms.map((room) => {
              const checked = selectedId === room.id;
              const avatar = getRoomAvatar(room);
              const title = getRoomTitle(room);

              return (
                <li key={room.id}>
                  <button
                    type="button"
                    disabled={sending}
                    onClick={() => setSelectedId(room.id)}
                    className={clsx(
                      'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left border',
                      checked &&
                        'bg-blue-50 border-blue-400',
                      !checked &&
                        'hover:bg-gray-50 border-transparent',
                      sending && 'opacity-60 cursor-not-allowed',
                    )}
                  >
                    {/* Avatar */}
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[10px] font-semibold text-gray-600">
                          {room.isGroup ? 'G' : 'U'}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {title}
                      </span>
                      <span className="text-xs text-gray-500">
                        {room.isGroup
                          ? 'Group chat'
                          : 'Direct message'}
                      </span>
                    </div>

                    {/* Check */}
                    <div className="ml-auto text-blue-600">
                      {checked ? '✓' : ''}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ===== Footer ===== */}
        <footer className="flex items-center justify-between border-t px-4 py-3">
          <span className="text-xs text-gray-500">
            {selectedId ? '1 selected' : 'Select a chat'}
          </span>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="
                rounded-md border px-3 py-1.5 text-sm
                hover:bg-gray-50
              "
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              disabled={!selectedId || sending}
              className="
                rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white
                hover:bg-blue-700 disabled:opacity-50
              "
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}


// frontend/src/components/share/pickers/ShareUserPicker.tsx


'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { api } from '@/lib/api/api';

type ShareUserItem = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;

  /**
   * 🔒 share permission (backend authority)
   */
  canReceiveShare?: boolean;
  shareBlockReason?:
    | 'NOT_FOLLOWING'
    | 'PRIVATE_ACCOUNT'
    | 'BLOCKED'
    | 'SHARE_DISABLED';
};

type Props = {
  title: string;
  onClose: () => void;
  onConfirm: (userIds: string[]) => void;
  max?: number; // default = 1
};

export default function ShareUserPicker({
  title,
  onClose,
  onConfirm,
  max = 1,
}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ShareUserItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* =========================
     Autofocus
     ========================= */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* =========================
     ESC to close
     ========================= */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  /* =========================
     Debounced search
     ========================= */
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await api.get<ShareUserItem[]>(
          `/users/search?query=${encodeURIComponent(query)}`,
          {
            withCredentials: true,
            signal: controller.signal,
          },
        );

        setResults(res.data);
      } catch (e: any) {
        if (e?.name === 'CanceledError') return;
        console.error('[ShareUserPicker] search failed', e);
        setError('ไม่สามารถค้นหาผู้ใช้ได้');
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  /* =========================
     Toggle select
     ========================= */
  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      const user = results.find((u) => u.id === id);

      // 🔒 blocked by backend policy
      if (user?.canReceiveShare === false) {
        return prev;
      }

      if (next.has(id)) {
        next.delete(id);
        return next;
      }

      if (max && next.size >= max) {
        return prev;
      }

      next.add(id);
      return next;
    });
  }

  /* =========================
     Confirm
     ========================= */
  function handleConfirm() {
    const ids = Array.from(selected);
    const finalIds = max ? ids.slice(0, max) : ids;
    onConfirm(finalIds);
  }

  function getBlockMessage(
    reason?: ShareUserItem['shareBlockReason'],
  ) {
    switch (reason) {
      case 'NOT_FOLLOWING':
        return 'ต้องติดตามกันก่อนจึงจะส่งได้';
      case 'PRIVATE_ACCOUNT':
        return 'บัญชีนี้เป็นส่วนตัว';
      case 'BLOCKED':
        return 'ไม่สามารถส่งให้ผู้ใช้นี้ได้';
      case 'SHARE_DISABLED':
        return 'ผู้ใช้นี้ปิดการรับการแชร์';
      default:
        return null;
    }
  }

  /* =========================
     Render
     ========================= */
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3"
      onClick={onClose}
    >
      <div
        className="
          w-full max-w-md rounded-xl bg-white shadow-xl
          flex flex-col overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===== Header ===== */}
        <header className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </header>

        {/* ===== Search ===== */}
        <div className="p-3">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อผู้ใช้"
            className="
              w-full rounded-lg border px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />
        </div>

        {/* ===== Results ===== */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {loading && (
            <p className="px-2 py-2 text-xs text-gray-500">
              กำลังค้นหา…
            </p>
          )}

          {error && (
            <p className="px-2 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          {!loading && results.length === 0 && query && (
            <p className="px-2 py-2 text-xs text-gray-500">
              ไม่พบผู้ใช้
            </p>
          )}

          <ul className="flex flex-col gap-1">
            {results.map((u) => {
              const checked = selected.has(u.id);
              const disabled = u.canReceiveShare === false;
              const reasonMsg = getBlockMessage(
                u.shareBlockReason,
              );

              return (
                <li key={u.id}>
                  <button
                    type="button"
                    aria-disabled={disabled}
                    onClick={() => toggle(u.id)}
                    className={clsx(
                      'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left border',
                      checked &&
                        'bg-blue-50 border-blue-400',
                      !checked &&
                        !disabled &&
                        'hover:bg-gray-50 border-transparent',
                      disabled &&
                        'opacity-50 cursor-not-allowed border-transparent',
                    )}
                  >
                    {/* Avatar */}
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : null}
                    </div>

                    {/* Name */}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {u.displayName || u.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        @{u.username}
                      </span>

                      {disabled && reasonMsg && (
                        <span className="text-[10px] text-red-500">
                          {reasonMsg}
                        </span>
                      )}
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
            {selected.size}
            {max ? ` / ${max}` : ''} คน
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
              disabled={selected.size === 0}
              className="
                rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white
                hover:bg-blue-700 disabled:opacity-50
              "
            >
              ส่งโพสต์
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}


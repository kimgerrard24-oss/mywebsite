// frontend/src/components/users/UserPickerModal.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { api } from '@/lib/api/api';

type UserItem = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;

  // 🔥 tag permission hint
  canBeTagged?: boolean;
  tagBlockReason?:
    | "FOLLOWERS_ONLY"
    | "FOLLOWING_ONLY"
    | "TAG_DISABLED"
    | "BLOCKED";
};


type Props = {
  title: string;
  onClose: () => void;
  onConfirm: (userIds: string[]) => void;
  max?: number;
};

export default function UserPickerModal({
  title,
  onClose,
  onConfirm,
  max,
}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  
  // =========================
  // Autofocus
  // =========================
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
  // Debounced search
  // =========================
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

        const res = await api.get<UserItem[]>(
  `/users/search?query=${encodeURIComponent(query)}`,
  {
    withCredentials: true,
    signal: controller.signal,
  },
);

  
        setResults(res.data);
      } catch (e: any) {
        if (e?.name === 'CanceledError') return;
        console.error('[UserPickerModal] search failed', e);
        setError('Unable to search users');
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


  // =========================
  // Toggle select
  // =========================
  function toggle(id: string) {
  setSelected((prev) => {
    const next = new Set(prev);

    const user = results.find((u) => u.id === id);

if (user?.canBeTagged === false) {
  return prev; // ❌ blocked by policy
}


    if (max && next.size >= max) {
      return prev; // ❌ block selecting more
    }

    next.add(id);
    return next;
  });
}


  // =========================
  // Confirm
  // =========================
  function handleConfirm() {
  const ids = Array.from(selected);
  const finalIds = max ? ids.slice(0, max) : ids;
  onConfirm(finalIds);
}


function getTagBlockMessage(reason?: UserItem["tagBlockReason"]) {
  switch (reason) {
    case "FOLLOWERS_ONLY":
      return "แท็กได้เฉพาะผู้ติดตาม";
    case "FOLLOWING_ONLY":
      return "แท็กได้เฉพาะคนที่เขาติดตาม";
    case "TAG_DISABLED":
      return "ไม่อนุญาตให้แท็ก";
    case "BLOCKED":
      return "ไม่สามารถแท็กผู้ใช้นี้ได้";
    default:
      return null;
  }
}

  // =========================
  // Render
  // =========================
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
            placeholder="Search by username or name"
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
              Searching…
            </p>
          )}

          {error && (
            <p className="px-2 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          {!loading && results.length === 0 && query && (
            <p className="px-2 py-2 text-xs text-gray-500">
              No users found
            </p>
          )}

          <ul className="flex flex-col gap-1">
            {results.map((u) => {
              const checked = selected.has(u.id);
const disabled = u.canBeTagged === false;
const reasonMsg = getTagBlockMessage(u.tagBlockReason);


              return (
                <li key={u.id}>
                  <button
                    type="button"
                    aria-disabled={disabled}
                    onClick={() => toggle(u.id)}
                    className={clsx(
  'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left border',
  checked && 'bg-blue-50 border-blue-400',
  !checked && !disabled && 'hover:bg-gray-50 border-transparent',
  disabled && 'opacity-50 cursor-not-allowed border-transparent',
)}

                  >
                    {/* Avatar */}
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt=""
                          className="h-full w-full object-cover"
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
  {max ? ` / ${max}` : ''} selected
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
              Confirm
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

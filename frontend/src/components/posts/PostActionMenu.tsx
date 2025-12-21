// frontend/src/components/posts/PostActionMenu.tsx
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import DeletePostButton from "@/components/posts/DeletePostButton";

type Props = {
  postId: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canReport?: boolean;

  // ✅ รองรับเฉพาะหน้า Post Detail (optional)
  onDeleted?: () => void;
};

export default function PostActionMenu({
  postId,
  canEdit = false,
  canDelete = false,
  canReport = false,
  onDeleted,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Close dropdown when click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ถ้าไม่มี action ใด ๆ เลย → ไม่ render
  if (!canEdit && !canDelete && !canReport) {
    return null;
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="
          inline-flex items-center justify-center
          h-9 w-9
          rounded-full
          text-gray-800
          hover:bg-gray-200
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-blue-500
          transition
        "
        title="Post actions"
      >
        <span className="text-lg leading-none">⋯</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-44 rounded-md border border-gray-200 bg-white shadow-lg"
        >
          <ul className="py-1 text-sm text-gray-700">
            <li>
            <Link
                  href={`/posts/${postId}`}
                  role="menuitem"
                  onClick={() => setOpen(false)}
              className="block px-4 py-2 hover:bg-gray-100"
                >
                  ดูโพสต์
            </Link>
            </li>
            {canEdit && (
              <li>
                <Link
                  href={`/posts/edit?id=${postId}`}
                  className="block px-4 py-2 hover:bg-gray-100"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  แก้ไขโพสต์
                </Link>
              </li>
            )}

            {canDelete && (
              <li className="px-4 py-2 hover:bg-gray-100">
                <DeletePostButton
                  postId={postId}
                  canDelete={canDelete}
                  variant="menu"
                  onDone={() => {
                    setOpen(false);
                    onDeleted?.();
                  }}
                />
              </li>
            )}

            {canReport && (
              <li>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    // TODO: open report modal
                  }}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  รายงานโพสต์
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

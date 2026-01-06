// frontend/src/components/posts/PostActionMenu.tsx
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import DeletePostButton from "@/components/posts/DeletePostButton";
import ReportDialog from "@/components/report/ReportDialog";

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
  const [reportOpen, setReportOpen] = useState(false);

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
  <div
    ref={ref}
    className="
      relative
      inline-block
    "
  >
    {/* ===== Trigger ===== */}
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => setOpen((v) => !v)}
      title="Post actions"
      className="
        inline-flex
        items-center
        justify-center
        h-8
        w-8
        sm:h-9
        sm:w-9
        rounded-full
        text-gray-800
        hover:bg-gray-200
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-blue-500
        transition
      "
    >
      <span
        className="
          text-base
          sm:text-lg
          leading-none
        "
        aria-hidden="true"
      >
        ⋯
      </span>
    </button>

    {/* ===== Dropdown ===== */}
    {open && (
      <div
        role="menu"
        aria-label="Post actions menu"
        className="
          absolute
          right-0
          z-20
          mt-2
          w-40
          sm:w-44
          rounded-md
          border
          border-gray-200
          bg-white
          shadow-lg
        "
      >
        <ul
          className="
            py-1
            text-xs
            sm:text-sm
            text-gray-700
          "
        >
          <li>
            <Link
              href={`/posts/${postId}`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="
                block
                px-3
                sm:px-4
                py-2
                hover:bg-gray-100
              "
            >
              ดูโพสต์
            </Link>
          </li>

          {canEdit && (
            <li>
              <Link
                href={`/posts/edit?id=${postId}`}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="
                  block
                  px-3
                  sm:px-4
                  py-2
                  hover:bg-gray-100
                "
              >
                แก้ไขโพสต์
              </Link>
            </li>
          )}

          {canDelete && (
            <li
              className="
                px-3
                sm:px-4
                py-1
                hover:bg-gray-100
              "
            >
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
        setReportOpen(true);
      }}
      className="
        block
        w-full
        px-3
        sm:px-4
        py-2
        text-left
        hover:bg-gray-100
      "
    >
      รายงานโพสต์
    </button>
  </li>
 )}

        </ul>
      </div>
    )}
    {reportOpen && (
  <ReportDialog
    targetType="POST"
    targetId={postId}
    onClose={() => setReportOpen(false)}
  />
 )}
  </div>
 );

}

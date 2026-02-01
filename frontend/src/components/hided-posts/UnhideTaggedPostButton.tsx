// frontend/src/components/hided-posts/UnhideTaggedPostButton.tsx
import { useState } from "react";

type Props = {
  onClick: () => Promise<void> | void;
};

export default function UnhideTaggedPostButton({ onClick }: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        if (loading) return;
        setLoading(true);
        try {
          await onClick();
        } finally {
          setLoading(false);
        }
      }}
      className="rounded border px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-50"
    >
      {loading ? "กำลังแสดง..." : "แสดงบนโปรไฟล์"}
    </button>
  );
}

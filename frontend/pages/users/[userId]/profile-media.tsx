// frontend/src/pages/users/[userId]/profile-media.tsx

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useProfileMediaFeed } from "@/hooks/useProfileMediaFeed";
import { ProfileMediaGrid } from "@/components/profile/ProfileMediaGrid";
import { ProfileMediaModal } from "@/components/profile/ProfileMediaModal";

export default function ProfileMediaPage() {
  const router = useRouter();
  const { userId } = router.query as { userId: string };

  const { items, loadMore, loading, hasMore } =
    useProfileMediaFeed(userId);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (userId) {
      loadMore();
    }
  }, [userId]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-lg font-semibold mb-4">
        Profile Media
      </h1>

      <ProfileMediaGrid
        items={items}
        onClick={(i) => setActiveIndex(i)}
      />

      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-4 py-2 border rounded-md"
          >
            {loading ? "กำลังโหลด..." : "โหลดเพิ่ม"}
          </button>
        </div>
      )}

      {activeIndex !== null && (
        <ProfileMediaModal
          items={items}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={setActiveIndex}
        />
      )}
    </div>
  );
}

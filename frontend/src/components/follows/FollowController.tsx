// frontend/src/components/follows/FollowController.tsx
import {
  useEffect,
  useState,
  useRef,
  MouseEvent,
} from "react";
import FollowButton from "@/components/follows/FollowButton";
import { useUnfollowUser } from "@/hooks/useUnfollowUser";

type Props = {
  userId: string;
  isFollowing: boolean;
  onChange?: (isFollowing: boolean) => void;
};

export default function FollowController({
  userId,
  isFollowing: initialIsFollowing,
  onChange,
}: Props) {
  const [isFollowing, setIsFollowing] =
    useState(initialIsFollowing);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    unfollow,
    loading: unfollowing,
  } = useUnfollowUser({ userId });

  // sync จาก backend (SSR / refetch)
  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    function handleClickOutside(e: globalThis.MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  function toggleMenu(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen((v) => !v);
  }

  async function handleUnfollow() {
    if (unfollowing) return;

    try {
      await unfollow(); // backend authority
      setIsFollowing(false);
      onChange?.(false);
      setOpen(false);
    } catch {
      // fail-soft
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ===== FOLLOW ===== */}
      {!isFollowing && (
        <FollowButton
          userId={userId}
          isFollowing={false}
          onFollowed={() => {
            setIsFollowing(true);
            onChange?.(true);
          }}
        />
      )}

      {/* ===== FOLLOWING + DROPDOWN ===== */}
      {isFollowing && (
        <>
          <button
            type="button"
            onClick={toggleMenu}
            aria-haspopup="menu"
            aria-expanded={open}
            className="
              inline-flex items-center gap-1
              rounded-full bg-gray-200
              px-4 py-1.5 text-sm font-medium
              text-gray-700 hover:bg-gray-300
              transition
            "
          >
            Following
            <span aria-hidden="true">▾</span>
          </button>

          {open && (
            <div
              role="menu"
              className="
                absolute right-0 z-20 mt-2 w-40
                rounded-md border border-gray-200
                bg-white shadow-lg
              "
            >
              <button
                type="button"
                onClick={handleUnfollow}
                disabled={unfollowing}
                className="
                  w-full px-4 py-2 text-left text-sm
                  text-red-600 hover:bg-gray-50
                  disabled:opacity-60
                "
              >
                {unfollowing ? "Unfollowing…" : "Unfollow"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

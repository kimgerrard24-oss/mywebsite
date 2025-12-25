// frontend/src/components/follows/FollowController.tsx
import {
  useEffect,
  useState,
  useRef,
  MouseEvent,
} from "react";
import FollowButton from "@/components/follows/FollowButton";
import UnfollowButton from "@/components/follows/UnfollowButton";

type Props = {
  userId: string;

  /**
   * initial state from backend (feed / profile)
   */
  isFollowing: boolean;

  /**
   * optional callback for parent sync
   */
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
  const containerRef = useRef<HTMLDivElement | null>(
    null,
  );

  /**
   * 🔒 sync state เมื่อ backend เปลี่ยน (SSR / refetch)
   */
  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  /**
   * 🔒 ปิด dropdown เมื่อคลิกข้างนอก
   */
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
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);


  function toggleMenu(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen((v) => !v);
  }

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ================= FOLLOW ================= */}
      {!isFollowing && (
        <FollowButton
          userId={userId}
          isFollowing={false}
          onFollowed={() => {
            // ✅ เปลี่ยน state หลัง backend สำเร็จ
            setIsFollowing(true);
            onChange?.(true);
          }}
        />
      )}

      {/* ================= FOLLOWING + DROPDOWN ================= */}
      {isFollowing && (
        <>
          <button
            type="button"
            onClick={toggleMenu}
            aria-haspopup="menu"
            aria-expanded={open}
            className="
              inline-flex
              items-center
              gap-1
              rounded-full
              bg-gray-200
              px-4
              py-1.5
              text-sm
              font-medium
              text-gray-700
              hover:bg-gray-300
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
                absolute
                right-0
                z-20
                mt-2
                w-40
                overflow-hidden
                rounded-md
                border
                border-gray-200
                bg-white
                shadow-lg
              "
            >
              {/* ===== Unfollow ===== */}
              <div className="p-1">
                <UnfollowButton
                  userId={userId}
                  isFollowing={true}
                  onUnfollowed={() => {
                    // ✅ เปลี่ยน state หลัง backend สำเร็จ
                    setIsFollowing(false);
                    onChange?.(false);
                    closeMenu();
                  }}
                />
              </div>

              {/* ===== future actions ===== */}
              {/*
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                Block
              </button>
              */}
            </div>
          )}
        </>
      )}
    </div>
  );
}


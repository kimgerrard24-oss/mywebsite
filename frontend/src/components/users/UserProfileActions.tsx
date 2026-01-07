// frontend/src/components/users/UserProfileActions.tsx

import BlockUserButton from "./BlockUserButton";
import UnblockUserButton from "./UnblockUserButton";

type Props = {
  profileUserId: string;

  /**
   * viewer id จาก backend session-check
   * (UX guard เท่านั้น)
   */
  viewerUserId?: string;

  /**
   * ระบุว่าขณะนี้ viewer block user นี้อยู่หรือไม่
   * ต้องมาจาก backend response เท่านั้น
   */
  isBlocked?: boolean;
};

export default function UserProfileActions({
  profileUserId,
  viewerUserId,
  isBlocked,
}: Props) {
  const isSelf =
    viewerUserId &&
    viewerUserId === profileUserId;

  // ถ้าเป็นตัวเอง ไม่ต้องแสดงปุ่ม Block/Unblock
  if (isSelf) return null;

  const canBlock =
    viewerUserId && isBlocked !== true; // แสดงปุ่ม Block ถ้ายังไม่บล็อก
  const canUnblock =
    viewerUserId && isBlocked === true; // แสดงปุ่ม Unblock ถ้าบล็อกแล้ว

  if (!canBlock && !canUnblock) return null;

  return (
    <nav
      aria-label="User actions"
      className="mt-4"
    >
      {canBlock && (
        <BlockUserButton
          targetUserId={profileUserId}
          onBlocked={() => {
            // เรียก backend เพื่อบล็อก user
            // เมื่อบล็อกเสร็จแล้วรีเฟรชสถานะ
            window.location.reload();
          }}
        />
      )}

      {canUnblock && (
        <UnblockUserButton
          targetUserId={profileUserId}
          onUnblocked={() => {
            // เรียก backend เพื่อยกเลิกบล็อก
            // เมื่อยกเลิกการบล็อกเสร็จแล้วรีเฟรชสถานะ
            window.location.reload();
          }}
        />
      )}
    </nav>
  );
}

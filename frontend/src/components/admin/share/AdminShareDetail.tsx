// frontend/src/components/admin/share/AdminShareDetail.tsx

import { useState } from "react";

import { disableShareByAdmin } from "@/lib/api/admin-shares";

import type {
  AdminShareDetail as ShareDetail,
} from "@/types/admin-share";

type Props = {
  share: ShareDetail;
};

export default function AdminShareDetail({
  share,
}: Props) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  const onDisable = async () => {
    if (!reason.trim()) {
      setError("กรุณาระบุเหตุผล");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await disableShareByAdmin({
        shareId: share.id,
        reason: reason.trim(),
      });

      setDone(true);
    } catch (err: any) {
      if (err?.status === 403) {
        setError("คุณไม่มีสิทธิ์ดำเนินการ");
      } else if (err?.status === 409) {
        setError("Share นี้ถูกปิดใช้งานแล้ว");
      } else {
        setError("เกิดข้อผิดพลาด");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="text-sm text-gray-600">
        <div>Share ID: {share.id}</div>
        <div>Post ID: {share.postId}</div>
        <div>Sender: {share.senderId}</div>
        <div>
          Status:{" "}
          {share.isDisabled
            ? "Disabled"
            : "Active"}
        </div>
      </div>

      {share.isDisabled || done ? (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          Share นี้ถูกปิดใช้งานแล้ว
        </div>
      ) : (
        <>
          <textarea
            value={reason}
            onChange={(e) =>
              setReason(e.target.value)
            }
            className="
              w-full
              rounded-md
              border
              p-2
              text-sm
              focus:outline-none
              focus:ring
            "
            rows={3}
            placeholder="เหตุผลในการปิด Share"
          />

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={onDisable}
            disabled={loading}
            className="
              rounded-md
              bg-red-600
              px-4
              py-2
              text-sm
              font-medium
              text-white
              hover:bg-red-700
              disabled:opacity-50
            "
          >
            {loading
              ? "กำลังปิด..."
              : "Disable Share"}
          </button>
        </>
      )}
    </div>
  );
}

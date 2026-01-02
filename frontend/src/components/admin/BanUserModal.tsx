// frontend/src/components/admin/BanUserModal.tsx

import { FormEvent, useEffect, useState } from "react";

type Props = {
  /**
   * ควบคุมการเปิด / ปิด modal
   */
  open: boolean;

  /**
   * แสดง loading state จาก backend
   */
  loading?: boolean;

  /**
   * error message จาก backend (ถ้ามี)
   */
  error?: string | null;

  /**
   * ต้องกรอก reason หรือไม่
   * - true: Ban
   * - false: Unban
   */
  requireReason?: boolean;

  /**
   * label ของ action (Ban / Unban)
   */
  actionLabel?: string;

  /**
   * confirm handler
   * - Ban: ส่ง reason
   * - Unban: reason จะเป็น string ว่าง
   */
  onConfirm: (reason: string) => void;

  /**
   * ปิด modal
   */
  onClose: () => void;
};

export default function BanUserModal({
  open,
  loading = false,
  error,
  requireReason = true,
  actionLabel = "Ban",
  onConfirm,
  onClose,
}: Props) {
  const [reason, setReason] = useState("");

  /**
   * Reset state ทุกครั้งที่ modal เปิด
   * ป้องกัน reason ค้างจากครั้งก่อน
   */
  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open]);

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (requireReason && reason.trim().length === 0) {
      return;
    }

    onConfirm(reason.trim());
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ban-user-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded bg-white p-4 shadow"
      >
        {/* ===== Title ===== */}
        <h2
          id="ban-user-title"
          className="mb-2 text-lg font-semibold"
        >
          {actionLabel} user
        </h2>

        {/* ===== Reason (เฉพาะ Ban) ===== */}
        {requireReason && (
          <>
            <label className="block text-sm font-medium">
              Reason
            </label>

            <textarea
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              rows={3}
              required
              className="mt-1 w-full rounded border p-2 text-sm"
              placeholder="Provide a reason for this action"
              disabled={loading}
            />
          </>
        )}

        {/* ===== Error ===== */}
        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* ===== Actions ===== */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-3 py-1 text-sm"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className={`rounded px-3 py-1 text-sm text-white ${
              actionLabel === "Unban"
                ? "bg-green-600"
                : "bg-red-600"
            }`}
            disabled={loading}
          >
            {loading
              ? `${actionLabel}ning…`
              : `${actionLabel} user`}
          </button>
        </div>
      </form>
    </div>
  );
}

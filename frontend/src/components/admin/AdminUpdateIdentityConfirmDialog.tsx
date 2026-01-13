// frontend/src/components/admin/AdminUpdateIdentityConfirmDialog.tsx

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
};

export default function AdminUpdateIdentityConfirmDialog({
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded bg-white p-5">
        <h3 className="text-lg font-semibold text-red-700">
          Confirm Identity Override
        </h3>

        <p className="mt-2 text-sm text-gray-600">
          This will change user identity and revoke
          all active sessions.
        </p>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded border px-3 py-1"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="rounded bg-red-600 px-3 py-1 text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

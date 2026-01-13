// frontend/src/components/admin/AdminUpdateIdentityForm.tsx

import { useState } from "react";
import AdminUpdateIdentityConfirmDialog from "./AdminUpdateIdentityConfirmDialog";
import { useAdminUpdateIdentity } from "@/hooks/useAdminUpdateIdentity";

type Props = {
  userId: string;
  onSuccess: () => void;
};

export default function AdminUpdateIdentityForm({
  userId,
  onSuccess,
}: Props) {
  const { submit, loading, error } =
    useAdminUpdateIdentity();

  const [username, setUsername] =
    useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");

  const [confirm, setConfirm] =
    useState(false);

  async function onConfirm() {
    const ok = await submit(userId, {
      username: username || undefined,
      email: email || undefined,
      phoneNumber: phone || undefined,
      reason,
    });

    if (ok) onSuccess();
  }

  return (
    <div className="space-y-4">
      <input
        placeholder="New username"
        className="w-full rounded border px-3 py-2"
        value={username}
        onChange={(e) =>
          setUsername(e.target.value)
        }
      />

      <input
        placeholder="New email"
        className="w-full rounded border px-3 py-2"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        placeholder="New phone"
        className="w-full rounded border px-3 py-2"
        value={phone}
        onChange={(e) =>
          setPhone(e.target.value)
        }
      />

      <textarea
        placeholder="Reason (required)"
        className="w-full rounded border px-3 py-2"
        value={reason}
        onChange={(e) =>
          setReason(e.target.value)
        }
      />

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        disabled={loading || !reason}
        onClick={() => setConfirm(true)}
        className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
      >
        Update Identity
      </button>

      {confirm && (
        <AdminUpdateIdentityConfirmDialog
          onCancel={() => setConfirm(false)}
          onConfirm={onConfirm}
        />
      )}
    </div>
  );
}

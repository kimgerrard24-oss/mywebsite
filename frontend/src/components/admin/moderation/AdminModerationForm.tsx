// frontend/src/components/admin/moderation/AdminModerationForm.tsx

import { useState } from "react";
import type {
  ModerationActionType,
  ModerationTargetType,
} from "@/types/moderation-action";

type Props = {
  targetType: ModerationTargetType;
  targetId: string;
  onConfirm: (params: {
    actionType: ModerationActionType;
    reason: string;
  }) => void;
};

export default function AdminModerationForm({
  targetType,
  targetId,
  onConfirm,
}: Props) {
  const [actionType, setActionType] =
    useState<ModerationActionType>("FLAG");
  const [reason, setReason] = useState("");

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onConfirm({ actionType, reason });
      }}
    >
      <input
        type="hidden"
        value={targetId}
      />

      <div>
        <label className="block text-sm font-medium">
          Action
        </label>
        <select
          className="mt-1 w-full rounded border p-2"
          value={actionType}
          onChange={(e) =>
            setActionType(
              e.target.value as ModerationActionType,
            )
          }
        >
          <option value="FLAG">
            Flag
          </option>
          {targetType === "USER" && (
            <option value="BAN">
              Ban user
            </option>
          )}
          {targetType !== "USER" && (
            <option value="HIDE">
              Hide content
            </option>
          )}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">
          Reason
        </label>
        <textarea
          className="mt-1 w-full rounded border p-2"
          rows={3}
          required
          value={reason}
          onChange={(e) =>
            setReason(e.target.value)
          }
        />
      </div>

      <button
        type="submit"
        className="rounded bg-red-600 px-4 py-2 text-white"
      >
        Continue
      </button>
    </form>
  );
}

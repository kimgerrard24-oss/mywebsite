// frontend/src/components/admin/moderation/AdminModerationForm.tsx

import { useEffect, useState } from "react";
import type {
  ModerationActionType,
  ModerationTargetType,
} from "@/types/moderation-action";

type Props = {
  targetType: ModerationTargetType;
  targetId: string;

  /**
   * Current target hidden state
   * (source of truth comes from backend)
   */
  isHidden?: boolean;

  /**
   * Submit moderation intent
   * Backend is authority
   */
  onConfirm: (params: {
    actionType: ModerationActionType;
    reason: string;
  }) => void;

  /**
   * Optional loading guard
   */
  loading?: boolean;
};

export default function AdminModerationForm({
  targetType,
  targetId,
  isHidden = false,
  onConfirm,
  loading = false,
}: Props) {
  const [actionType, setActionType] =
    useState<ModerationActionType>(() => {
      if (targetType === "USER") {
        return "BAN_USER";
      }
      return isHidden ? "UNHIDE" : "HIDE";
    });

  const [reason, setReason] = useState("");

  /**
   * Keep actionType in sync with target state
   * (UX guard only, do not override unnecessarily)
   */
  useEffect(() => {
    if (targetType === "USER") {
      if (actionType !== "BAN_USER") {
        setActionType("BAN_USER");
      }
      return;
    }

    if (isHidden && actionType === "HIDE") {
      setActionType("UNHIDE");
    }

    if (!isHidden && actionType === "UNHIDE") {
      setActionType("HIDE");
    }
  }, [targetType, isHidden, actionType]);

  /**
   * ===== Available actions (UX guard only) =====
   * Backend will re-validate everything
   */
  const availableActions: {
    value: ModerationActionType;
    label: string;
  }[] = [];

  if (targetType === "USER") {
    availableActions.push({
      value: "BAN_USER",
      label: "Ban user",
    });
  } else if (isHidden) {
    availableActions.push({
      value: "UNHIDE",
      label: "Unhide content",
    });
  } else {
    availableActions.push({
      value: "HIDE",
      label: "Hide content",
    });
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();

        if (!reason.trim()) return;

        onConfirm({
          actionType,
          reason: reason.trim(),
        });
      }}
    >
      {/* ===== Hidden target ===== */}
      <input type="hidden" value={targetId} />

      {/* ===== Action ===== */}
      <div>
        <label className="block text-sm font-medium">
          Moderation action
        </label>
        <select
          className="mt-1 w-full rounded border px-2 py-1 text-sm"
          value={actionType}
          disabled={loading}
          onChange={(e) =>
            setActionType(
              e.target.value as ModerationActionType,
            )
          }
        >
          {availableActions.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      {/* ===== Reason ===== */}
      <div>
        <label className="block text-sm font-medium">
          Reason
        </label>
        <textarea
          className="mt-1 w-full rounded border px-2 py-1 text-sm"
          rows={3}
          required
          disabled={loading}
          value={reason}
          onChange={(e) =>
            setReason(e.target.value)
          }
        />
        <p className="mt-1 text-xs text-gray-500">
          Reason will be recorded in moderation audit log
        </p>
      </div>

      {/* ===== Submit ===== */}
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        {loading ? "Processing…" : "Continue"}
      </button>
    </form>
  );
}

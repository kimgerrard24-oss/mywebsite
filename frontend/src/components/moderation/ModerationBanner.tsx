// frontend/src/components/moderation/ModerationBanner.tsx

type Props = {
  actionType: string;
  reason?: string | null;
  createdAt: string;
};

export default function ModerationBanner({
  actionType,
  reason,
  createdAt,
}: Props) {
  return (
    <section
      role="alert"
      className="
        rounded-lg
        border border-red-200
        bg-red-50
        p-4
        space-y-2
      "
    >
      <p className="text-sm font-medium text-red-700">
        This post has been moderated by admin
      </p>

      <p className="text-xs text-red-700">
        Action: {actionType}
      </p>

      {reason && (
        <p className="text-xs text-red-700">
          Reason: {reason}
        </p>
      )}

      <p className="text-xs text-gray-600">
        {new Date(createdAt).toLocaleString()}
      </p>
    </section>
  );
}

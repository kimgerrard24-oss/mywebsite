// frontend/src/components/security/SecurityEventList.tsx

import type { SecurityEvent } from "@/types/security-event";

type Props = {
  events: SecurityEvent[];
};

function formatType(type: string) {
  const map: Record<string, string> = {
    LOGIN_FAILED: "Failed login attempt",
    CREDENTIAL_VERIFIED: "Security verification passed",
    ACCOUNT_LOCKED: "Account locked",
    PROFILE_EXPORTED: "Profile data exported",
  };

  return map[type] ?? type.replace(/_/g, " ").toLowerCase();
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function SecurityEventList({ events }: Props) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No security activity yet.
      </p>
    );
  }

  return (
    <ul className="divide-y rounded-lg border">
      {events.map((e) => (
        <li key={e.id} className="p-4">
          <div className="flex justify-between gap-4">
            <div>
              <p className="text-sm font-medium">
                {formatType(e.type)}
              </p>

              {e.ip && (
                <p className="text-xs text-gray-500">
                  IP: {e.ip}
                </p>
              )}

              {e.userAgent && (
                <p className="mt-1 text-xs text-gray-500 line-clamp-2 break-all">
                  {e.userAgent}
                </p>
              )}
            </div>

            <time
              className="text-xs text-gray-400 whitespace-nowrap"
              dateTime={e.createdAt}
            >
              {formatTime(e.createdAt)}
            </time>
          </div>
        </li>
      ))}
    </ul>
  );
}

// frontend/src/components/security/SecurityEventList.tsx

import type { SecurityEvent } from "@/types/security-event";

type Props = {
  events: SecurityEvent[];
};

function formatType(type: string) {
  return type.replace(/_/g, " ").toLowerCase();
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
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                  {e.userAgent}
                </p>
              )}
            </div>

            <time
              className="text-xs text-gray-400"
              dateTime={e.createdAt}
            >
              {new Date(e.createdAt).toLocaleString()}
            </time>
          </div>
        </li>
      ))}
    </ul>
  );
}

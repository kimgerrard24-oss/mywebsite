// frontend/src/components/admin/AdminPageGuard.tsx
import { ReactNode } from "react";

type Props = {
  allowed: boolean;
  children: ReactNode;
};

export default function AdminPageGuard({
  allowed,
  children,
}: Props) {
  if (!allowed) {
    return (
      <p className="p-4 text-sm text-gray-600">
        Access denied
      </p>
    );
  }

  return <>{children}</>;
}

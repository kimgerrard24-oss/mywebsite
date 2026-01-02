// frontend/src/components/admin/AdminPageGuard.tsx

import { ReactNode } from "react";

type Props = {
  /**
   * ผลการอนุญาตจาก backend
   * true  = เข้าถึงได้
   * false = ไม่ได้รับอนุญาต
   */
  allowed: boolean;

  /**
   * admin content
   */
  children: ReactNode;
};

export default function AdminPageGuard({
  allowed,
  children,
}: Props) {
  /**
   * 🔒 Fail-safe
   * backend = authority
   */
  if (!allowed) {
    return (
      <section
        role="alert"
        aria-live="polite"
        className="flex min-h-[40vh] flex-col items-center justify-center p-6 text-center"
      >
        <h1 className="mb-2 text-lg font-semibold">
          Access denied
        </h1>

        <p className="max-w-md text-sm text-gray-600">
          You do not have permission to access this
          administrative area. If you believe this is
          an error, please contact a system
          administrator.
        </p>
      </section>
    );
  }

  /**
   * ✅ Authorized
   */
  return (
    <section
      role="region"
      aria-label="Admin content"
      className="w-full"
    >
      {children}
    </section>
  );
}

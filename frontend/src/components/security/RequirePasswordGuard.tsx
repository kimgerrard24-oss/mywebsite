// frontend/src/components/security/RequirePasswordGuard.tsx
"use client";

import { useEffect } from "react";
import { redirectToSetPassword } from "@/lib/security/requirePassword";

type Props = {
  requirePassword: boolean;
};

export default function RequirePasswordGuard({
  requirePassword,
}: Props) {
  useEffect(() => {
    if (requirePassword) {
      redirectToSetPassword();
    }
  }, [requirePassword]);

  return null;
}

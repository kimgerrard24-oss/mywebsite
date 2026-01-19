// frontend/src/lib/security/requirePassword.ts

export function redirectToSetPassword() {
  if (typeof window !== "undefined") {
    window.location.href = "/settings/set-password";
  }
}

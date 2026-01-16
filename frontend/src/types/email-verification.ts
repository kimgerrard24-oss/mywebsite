// frontend/src/types/email-verification.ts

export type ResendVerificationState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "success" }
  | { status: "error"; message: string };

// backend/src/mail/email-verification.template.ts

export const emailVerificationTemplate = (verifyUrl: string) => `
  <div style="font-family:sans-serif;">
    <h2>Verify your email</h2>
    <p>Please click the link below to confirm your email address:</p>
    <a href="${verifyUrl}" style="color:#4f46e5;">Verify Email</a>
    <p>If you did not create this account, you can ignore this email.</p>
  </div>
`;

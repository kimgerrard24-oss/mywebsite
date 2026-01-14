// backend/src/mail/email-change-confirmation.template.ts

export function emailChangeConfirmationTemplate(
  confirmUrl: string,
): string {
  return `
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.5">
    <h2>Confirm your new email address</h2>

    <p>
      You requested to change your email address for your PhlyPhant account.
    </p>

    <p>
      Please confirm this change by clicking the button below:
    </p>

    <p style="margin: 24px 0">
      <a
        href="${confirmUrl}"
        style="
          background:#4f46e5;
          color:white;
          padding:12px 18px;
          text-decoration:none;
          border-radius:6px;
          display:inline-block;
        "
      >
        Confirm email change
      </a>
    </p>

    <p style="color:#666;font-size:14px">
      If you did not request this change, you can safely ignore this email.
      Your email address will not be updated.
    </p>
  </div>
  `;
}

// src/mail/templates/password-reset-email.template.ts

export interface PasswordResetEmailTemplateParams {
  usernameOrEmail: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export interface PasswordResetEmailTemplateResult {
  subject: string;
  text: string;
  html: string;
}

export function buildPasswordResetEmailTemplate(
  params: PasswordResetEmailTemplateParams,
): PasswordResetEmailTemplateResult {
  const { usernameOrEmail, resetUrl, expiresInMinutes } = params;

  const subject = 'Reset your password';

  const text = [
    `Hi ${usernameOrEmail},`,
    '',
    'We received a request to reset your password.',
    `You can reset your password by clicking the link below (valid for ${expiresInMinutes} minutes):`,
    '',
    resetUrl,
    '',
    'If you did not request this, you can safely ignore this email.',
  ].join('\n');

  const html = `
    <p>Hi ${usernameOrEmail},</p>
    <p>We received a request to reset your password.</p>
    <p>
      You can reset your password by clicking the button below
      (valid for ${expiresInMinutes} minutes):
    </p>
    <p>
      <a href="${resetUrl}" 
         style="
           display:inline-block;
           padding:10px 18px;
           border-radius:4px;
           text-decoration:none;
           background-color:#2563eb;
           color:#ffffff;
           font-weight:600;
         ">
        Reset your password
      </a>
    </p>
    <p>If the button does not work, copy and paste this URL into your browser:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>If you did not request this, you can safely ignore this email.</p>
  `;

  return { subject, text, html };
}

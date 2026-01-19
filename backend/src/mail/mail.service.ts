// backend/src/mail/mail.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { emailVerificationTemplate } from './email-verification.template';
import {
  buildPasswordResetEmailTemplate,
} from './templates/password-reset-email.template';

const RESEND_RETRY_ATTEMPTS = 2; // soft retry for transient network / provider hiccup

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;
  private readonly from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.MAIL_FROM;

    // =====================================================
    // ✅ Fail-fast on infra misconfiguration
    //    (prevent half-working instances in production)
    // =====================================================
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      this.logger.error('RESEND_API_KEY is not configured');
      throw new Error('MailService misconfigured: RESEND_API_KEY missing');
    }

    if (!from || typeof from !== 'string' || from.trim() === '') {
      this.logger.error('MAIL_FROM is not configured');
      throw new Error('MailService misconfigured: MAIL_FROM missing');
    }

    this.resend = new Resend(apiKey);
    this.from = from;
  }

  // =====================================================
  // Email Verification (register / email change)
  // =====================================================

  /**
   * Send email verification link
   *
   * IMPORTANT (Production rules):
   * - Do NOT log email
   * - Do NOT log verification link
   * - Throw on failure → caller decides business behavior
   */
  async sendEmailVerification(
    to: string,
    verifyUrl: string,
  ): Promise<void> {
    const html = emailVerificationTemplate(verifyUrl);

    let lastError: unknown;

    for (let attempt = 1; attempt <= RESEND_RETRY_ATTEMPTS; attempt++) {
      try {
        const result = await this.resend.emails.send({
          from: this.from,
          to,
          subject: 'Verify your email',
          html,
        });

        if (result && (result as any).error) {
          // provider responded but with error
          this.logger.error(
            'Resend returned error while sending verification email',
            (result as any).error,
          );
          throw (result as any).error;
        }

        // ✅ success
        return;
      } catch (err: any) {
        lastError = err;

        this.logger.error(
          `Failed to send verification email via Resend (attempt ${attempt}/${RESEND_RETRY_ATTEMPTS})`,
          err?.stack || String(err),
        );

        // retry only if not last attempt
        if (attempt < RESEND_RETRY_ATTEMPTS) {
          await this.delay(300 * attempt); // small backoff
          continue;
        }

        // final failure → propagate to caller
        throw err;
      }
    }

    // defensive (should never reach here)
    throw lastError;
  }

  // =====================================================
  // Password Reset
  // =====================================================

  /**
   * Send password reset email
   *
   * SECURITY RULES:
   * - Do NOT log email
   * - Do NOT log reset URL
   * - Do NOT throw (prevent account enumeration)
   * - Infra failures must not affect business response
   */
  async sendPasswordResetEmail(params: {
    to: string;
    resetUrl: string;
    expiresInMinutes: number;
    usernameOrEmail?: string | null;
  }): Promise<void> {
    const {
      to,
      resetUrl,
      expiresInMinutes,
      usernameOrEmail,
    } = params;

    const { subject, html, text } =
      buildPasswordResetEmailTemplate({
        usernameOrEmail: usernameOrEmail || to,
        resetUrl,
        expiresInMinutes,
      });

    for (let attempt = 1; attempt <= RESEND_RETRY_ATTEMPTS; attempt++) {
      try {
        const result = await this.resend.emails.send({
          from: this.from,
          to,
          subject,
          html,
          text,
        });

        if (result && (result as any).error) {
          this.logger.error(
            'Resend returned error while sending password reset email',
            (result as any).error,
          );
          return; // ❗ do NOT throw (anti enumeration)
        }

        return; // success
      } catch (err: any) {
        this.logger.error(
          `Failed to send password reset email via Resend (attempt ${attempt}/${RESEND_RETRY_ATTEMPTS})`,
          err?.stack || String(err),
        );

        if (attempt < RESEND_RETRY_ATTEMPTS) {
          await this.delay(300 * attempt);
          continue;
        }

        // ❗ must not throw
        return;
      }
    }
  }

  // =====================================================
  // Utils
  // =====================================================
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // =====================================================
// Set Password (Social → Local)
// =====================================================

/**
 * Send set-password email for social-login users
 *
 * SECURITY RULES:
 * - Do NOT log email
 * - Do NOT log link
 * - Do NOT throw (anti enumeration)
 * - Infra failures must not affect business response
 */
async sendSetPasswordEmail(
  to: string,
  setPasswordUrl: string,
): Promise<void> {
  const subject = 'Set your PhlyPhant password';

  const html = `
    <p>You requested to set a password for your PhlyPhant account.</p>
    <p><a href="${setPasswordUrl}">Click here to set your password</a></p>
    <p>This link will expire in 30 minutes.</p>
    <p>If you did not request this, you can safely ignore this email.</p>
  `;

  for (let attempt = 1; attempt <= RESEND_RETRY_ATTEMPTS; attempt++) {
    try {
      const result = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
      });

      if (result && (result as any).error) {
        this.logger.error(
          'Resend returned error while sending set-password email',
          (result as any).error,
        );
        return; // ❗ do NOT throw
      }

      return; // success
    } catch (err: any) {
      this.logger.error(
        `Failed to send set-password email via Resend (attempt ${attempt}/${RESEND_RETRY_ATTEMPTS})`,
        err?.stack || String(err),
      );

      if (attempt < RESEND_RETRY_ATTEMPTS) {
        await this.delay(300 * attempt);
        continue;
      }

      // ❗ must not throw (anti-enumeration)
      return;
    }
  }
}

}



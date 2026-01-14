// backend/src/mail/mail.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { emailVerificationTemplate } from './email-verification.template';
import {
  buildPasswordResetEmailTemplate,
} from './templates/password-reset-email.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;
  private readonly from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.MAIL_FROM;

    if (!apiKey) {
      this.logger.error('RESEND_API_KEY is not configured');
    }

    if (!from) {
      this.logger.error('MAIL_FROM is not configured');
    }

    this.resend = new Resend(apiKey);
    this.from = from || 'no-reply@localhost';
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

    try {
      const result = await this.resend.emails.send({
        from: this.from,
        to,
        subject: 'Verify your email',
        html,
      });

      if (result.error) {
        this.logger.error(
          'Resend returned error while sending verification email',
          result.error,
        );
        throw result.error;
      }
    } catch (err: any) {
      this.logger.error(
        'Failed to send verification email via Resend',
        err?.stack || String(err),
      );
      throw err;
    }
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

    try {
      const result = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
        text,
      });

      if (result.error) {
        this.logger.error(
          'Resend returned error while sending password reset email',
          result.error,
        );
        // ❗ do NOT throw (anti account enumeration)
        return;
      }
    } catch (err: any) {
      this.logger.error(
        'Failed to send password reset email via Resend',
        err?.stack || String(err),
      );
      // ❗ must not throw
    }
  }
}


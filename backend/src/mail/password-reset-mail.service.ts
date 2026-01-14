// backend/src/mail/password-reset-mail.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import {
  buildPasswordResetEmailTemplate,
  PasswordResetEmailTemplateParams,
} from './templates/password-reset-email.template';

@Injectable()
export class PasswordResetMailService {
  private readonly logger = new Logger(
    PasswordResetMailService.name,
  );
  private readonly resend: Resend;
  private readonly fromAddress: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    const from =
      process.env.MAIL_FROM ||
      process.env.NEXT_PUBLIC_EMAIL_FROM;

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    if (!from) {
      throw new Error('MAIL_FROM is not configured');
    }

    this.resend = new Resend(apiKey);
    this.fromAddress = from;
  }

  async sendPasswordResetEmail(
    to: string,
    params: Omit<
      PasswordResetEmailTemplateParams,
      'usernameOrEmail'
    > & {
      usernameOrEmail?: string | null;
    },
  ): Promise<void> {
    const usernameOrEmail =
      params.usernameOrEmail || to;

    const { subject, text, html } =
      buildPasswordResetEmailTemplate({
        usernameOrEmail,
        resetUrl: params.resetUrl,
        expiresInMinutes: params.expiresInMinutes,
      });

    try {
      await this.resend.emails.send({
        from: this.fromAddress,
        to,
        subject,
        html,
        text,
      });
    } catch (error: any) {
      /**
       * ❗ SECURITY & PRIVACY
       * - Do NOT log email address
       * - Do NOT log reset URL
       * - Log only technical failure
       */
      this.logger.error(
        'Failed to send password reset email via Resend',
        error instanceof Error
          ? error.stack
          : String(error),
      );

      /**
       * IMPORTANT:
       * - Do NOT throw
       * - Email failure must not reveal account existence
       * - Business flow continues
       */
    }
  }
}

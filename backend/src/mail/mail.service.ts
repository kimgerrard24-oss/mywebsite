// backend/src/mail/mail.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { emailVerificationTemplate } from './email-verification.template';
import { emailChangeConfirmationTemplate } from './email-change-confirmation.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend?: Resend;
  private readonly from?: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.MAIL_FROM;

    if (!apiKey || !from) {
      /**
       * ⚠️ PRODUCTION RULE
       * - App must NOT crash if mail infra missing
       * - Log loudly so ops can fix
       */
      this.logger.error(
        '[MAIL_DISABLED] RESEND_API_KEY or MAIL_FROM is missing',
      );
      return;
    }

    this.resend = new Resend(apiKey);
    this.from = from;
  }

  // ==========================================================
  // Internal guard (never throw)
  // ==========================================================
  private isReady(): boolean {
    return Boolean(this.resend && this.from);
  }

  // ==========================================================
  // Low-level sender (single exit point)
  // ==========================================================
  private async send(params: {
    to: string;
    subject: string;
    html: string;
    tag: string; // for log / metric grouping
  }): Promise<boolean> {
    if (!this.isReady()) {
      this.logger.error(
        `[MAIL_NOT_READY] ${params.tag}`,
      );
      return false;
    }

    if (!params.to || !params.subject || !params.html) {
      this.logger.error(
        `[MAIL_INVALID_PARAMS] ${params.tag}`,
      );
      return false;
    }

    try {
      await this.resend!.emails.send({
        from: this.from!,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      return true;
    } catch (err: any) {
      /**
       * 🔐 SECURITY
       * - Do NOT log email
       * - Do NOT log html / url / token
       */
      this.logger.error(
        `[MAIL_SEND_FAILED] ${params.tag}`,
        err instanceof Error ? err.stack : String(err),
      );
      return false;
    }
  }

  // ==========================================================
  // Register → verify email
  // ==========================================================
  async sendEmailVerification(
    to: string,
    verifyUrl: string,
  ): Promise<void> {
    const html = emailVerificationTemplate(verifyUrl);

    await this.send({
      to,
      subject: 'Verify your email',
      html,
      tag: 'EMAIL_VERIFY',
    });
  }

  // ==========================================================
  // Change email → confirm new address
  // ==========================================================
  async sendEmailChangeConfirmation(
    to: string,
    confirmUrl: string,
  ): Promise<void> {
    const html =
      emailChangeConfirmationTemplate(confirmUrl);

    await this.send({
      to,
      subject: 'Confirm your new email address',
      html,
      tag: 'EMAIL_CHANGE_CONFIRM',
    });
  }
}

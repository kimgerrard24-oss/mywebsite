// file: src/mail/password-reset-mail.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { SES } from 'aws-sdk';
import {
  buildPasswordResetEmailTemplate,
  PasswordResetEmailTemplateParams,
} from './templates/password-reset-email.template';

@Injectable()
export class PasswordResetMailService {
  private readonly logger = new Logger(PasswordResetMailService.name);
  private readonly ses: SES;
  private readonly fromAddress: string;

  constructor() {
    /**
     * IMPORTANT:
     * SES region must match verified identity region
     */
    const region =
      process.env.AWS_REGION || 'ap-southeast-1';

    this.fromAddress =
      process.env.SES_FROM_ADDRESS ||
      process.env.NEXT_PUBLIC_EMAIL_FROM ||
      'support@phlyphant.com';

    if (!this.fromAddress) {
      this.logger.error(
        'SES_FROM_ADDRESS is not configured',
      );
    }

    if (!region) {
      this.logger.error(
        'AWS_REGION is not configured for SES',
      );
    }

    this.ses = new SES({
      region,
      maxRetries: 3, // production-safe retry
    });
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

    const emailParams: SES.SendEmailRequest = {
      Source: this.fromAddress,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: { Data: subject },
        Body: {
          Text: { Data: text },
          Html: { Data: html },
        },
      },
    };

    try {
      await this.ses.sendEmail(emailParams).promise();
    } catch (error: any) {
      /**
       * ❗ SECURITY & PRIVACY
       * - Do NOT log email address
       * - Do NOT log reset URL
       * - Log only technical failure
       */
      this.logger.error(
        'Failed to send password reset email via SES',
        error?.stack || String(error),
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

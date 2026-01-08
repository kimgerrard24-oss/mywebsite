// backend/src/mail/mail.service.ts

import { Injectable, Logger } from '@nestjs/common';
import {
  SESClient,
  SendEmailCommand,
} from '@aws-sdk/client-ses';
import { emailVerificationTemplate } from './email-verification.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private readonly ses: SESClient;

  constructor() {
    const region = process.env.AWS_REGION;
    const from = process.env.SES_FROM_EMAIL;

    if (!region) {
      this.logger.error(
        'AWS_REGION is not configured for SES',
      );
    }

    if (!from) {
      this.logger.error(
        'SES_FROM_EMAIL is not configured',
      );
    }

    this.ses = new SESClient({
      region,
      // production-safe defaults
      maxAttempts: 3, // retry on transient errors
    });
  }

  async sendEmailVerification(
    to: string,
    verifyUrl: string,
  ): Promise<void> {
    const html = emailVerificationTemplate(verifyUrl);

    const command = new SendEmailCommand({
      Destination: { ToAddresses: [to] },
      Source: process.env.SES_FROM_EMAIL,
      Message: {
        Subject: { Data: 'Verify your email' },
        Body: {
          Html: { Data: html },
        },
      },
    });

    try {
      await this.ses.send(command);
    } catch (err: any) {
      /**
       * ❗ IMPORTANT (production):
       * - Do NOT log email address
       * - Do NOT log verification link
       * - Log only technical failure
       */
      this.logger.error(
        'Failed to send verification email via SES',
        err?.stack || String(err),
      );

      // propagate error → caller decides retry / fallback
      throw err;
    }
  }
}

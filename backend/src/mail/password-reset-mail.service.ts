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
    // Default region (note: your AWS is ap-southeast-7, but SES may only exist ap-southeast-1)
    // This must match SES region in AWS console
    const region = process.env.AWS_REGION || 'ap-southeast-1';

    // Production email sender
    // Always use domain you verified in SES
    this.fromAddress =
      process.env.SES_FROM_ADDRESS ||
      process.env.NEXT_PUBLIC_EMAIL_FROM ||
      'support@phlyphant.com';

    this.ses = new SES({ region });
  }

  async sendPasswordResetEmail(
    to: string,
    params: Omit<PasswordResetEmailTemplateParams, 'usernameOrEmail'> & {
      usernameOrEmail?: string | null;
    },
  ): Promise<void> {
    // Display name or fallback to email
    const usernameOrEmail = params.usernameOrEmail || to;

    // Build content using your template
    const { subject, text, html } = buildPasswordResetEmailTemplate({
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
        Subject: {
          Data: subject,
        },
        Body: {
          Text: {
            Data: text,
          },
          Html: {
            Data: html,
          },
        },
      },
    };

    try {
      await this.ses.sendEmail(emailParams).promise();
    } catch (error) {
      // Only log here for monitoring
      // Do not reveal error to client
      this.logger.error(
        `Failed to send password reset email to ${to}: ${String(error)}`,
      );
      // Do not throw: email failure should not leak info
    }
  }
}

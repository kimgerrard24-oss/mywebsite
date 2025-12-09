// src/mail/password-reset-mail.service.ts

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
    const region = process.env.AWS_REGION || 'ap-southeast-7'; // ตามที่คุณใช้เป็น default
    this.fromAddress =
      process.env.SES_FROM_ADDRESS || 'no-reply@example.com'; // แก้ใน env บน production

    this.ses = new SES({ region });
  }

  async sendPasswordResetEmail(
    to: string,
    params: Omit<PasswordResetEmailTemplateParams, 'usernameOrEmail'> & {
      usernameOrEmail?: string | null;
    },
  ): Promise<void> {
    const usernameOrEmail = params.usernameOrEmail || to;

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
      // ไม่โยน error ออกไปให้รู้ว่า email ไหนมีปัญหา แค่ log ไว้ฝั่ง server
      this.logger.error(
        `Failed to send password reset email to ${to}: ${error}`,
      );
      // ใน production จริง อาจจะโยน custom error ภายใน เพื่อนำไปใช้ monitoring ได้
    }
  }
}

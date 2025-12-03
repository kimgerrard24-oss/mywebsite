// backend/src/mail/mail.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { emailVerificationTemplate } from './email-verification.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private ses = new SESClient({
    region: process.env.AWS_REGION,
  });

  async sendEmailVerification(to: string, verifyUrl: string) {
    const html = emailVerificationTemplate(verifyUrl);

    const command = new SendEmailCommand({
      Destination: { ToAddresses: [to] },
      Source: process.env.SES_FROM_EMAIL,
      Message: {
        Subject: { Data: 'Verify your email' },
        Body: { Html: { Data: html } },
      },
    });

    await this.ses.send(command);
  }
}

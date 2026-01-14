// backend/src/mail/mail.module.ts

import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { PasswordResetMailService } from './password-reset-mail.service';

@Module({
  providers: [
    MailService,
    PasswordResetMailService,
  ],
  exports: [
    MailService,
    PasswordResetMailService,
  ],
})
export class MailModule {}

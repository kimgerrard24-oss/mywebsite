// backend/src/auth/credential-verification.module.ts

import { Module } from '@nestjs/common';
import { CredentialVerificationService } from './credential-verification.service';

@Module({
  providers: [CredentialVerificationService],
  exports: [CredentialVerificationService], // 👈 สำคัญมาก: ให้ module อื่น inject ได้
})
export class CredentialVerificationModule {}

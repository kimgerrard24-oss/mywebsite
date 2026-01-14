// backend/src/identities/phone/phone-verification.service.ts

import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PhoneVerificationService {
  private readonly logger = new Logger(
    PhoneVerificationService.name,
  );

  /**
   * Send SMS for phone number change verification
   *
   * IMPORTANT SECURITY RULES:
   * - MUST NOT log raw token in production
   * - MUST throw on infra failure so service layer can react
   * - MUST NOT swallow provider errors silently
   */
  async sendChangePhoneSMS(params: {
    phone: string;
    token: string;
  }): Promise<void> {
    const { phone, token } = params;

    try {
      if (process.env.NODE_ENV !== 'production') {
        // ✅ DEV ONLY — visible token for testing
        this.logger.debug(
          `[DEV SMS] to=${phone} token=${token}`,
        );
        return;
      }

      // =================================================
      // ✅ PRODUCTION: integrate SMS provider here
      // =================================================
      // Example (pseudo):
      //
      // await this.smsProvider.send({
      //   to: phone,
      //   message: `Your verification code is ${token}`,
      // });
      //
      // =================================================

      // TEMP: until provider is wired
      this.logger.warn(
        'SMS provider not configured (production mode)',
      );
    } catch (err) {
      /**
       * CRITICAL:
       * - Do NOT log token
       * - Only log destination partially
       */
      const maskedPhone = phone.replace(
        /.(?=.{4})/g,
        '*',
      );

      this.logger.error(
        `Failed to send phone change SMS to ${maskedPhone}`,
        err instanceof Error ? err.stack : undefined,
      );

      // 🔥 MUST rethrow so UsersService can abort flow
      throw err;
    }
  }
}


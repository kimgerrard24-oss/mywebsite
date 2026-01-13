// backend/src/identities/phone/phone-verification.service.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class PhoneVerificationService {
  async sendChangePhoneSMS(params: {
    phone: string;
    token: string;
  }) {
    const { phone, token } = params;

    // PRODUCTION: integrate with SMS provider here
    // Twilio / AWS SNS / local gateway

    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `[DEV SMS] to ${phone} token=${token}`,
      );
    }

    // DO NOT throw unless infra failure
  }
}

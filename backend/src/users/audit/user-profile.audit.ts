// backend/src/users/audit/user-profile.audit.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UserProfileAudit {
  private readonly logger = new Logger('UserProfileAudit');

  logProfileUpdate(payload: {
    userId: string;
    fields: string[];
  }) {
    this.logger.log(
      `User ${payload.userId} updated profile fields: ${payload.fields.join(
        ', ',
      )}`,
    );
  }
}

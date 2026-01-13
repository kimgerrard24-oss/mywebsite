// backend/src/users/audit/audit.module.ts

import { Global, Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { SecurityEventsAudit } from './security-events.audit';
import { UserIdentityAudit } from './user-identity.audit';
import { UserProfileAudit } from './user-profile.audit';

@Global()
@Module({
  providers: [
    AuditLogService,
    SecurityEventsAudit,
    UserIdentityAudit,
    UserProfileAudit,
  ],
  exports: [
    AuditLogService,
    SecurityEventsAudit,
    UserIdentityAudit,
    UserProfileAudit,
  ],
})
export class AuditModule {}



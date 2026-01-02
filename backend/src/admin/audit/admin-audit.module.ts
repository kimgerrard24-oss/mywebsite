// backend/src/admin/audit/admin-audit.module.ts

import { Module } from '@nestjs/common';
import { AdminAuditService } from './admin-audit.service';
import { RequestContextModule } from '../../common/middleware/request-context.module'

@Module({
  imports: [RequestContextModule],
  providers: [AdminAuditService],
  exports: [AdminAuditService], 
})
export class AdminAuditModule {}

// backend/src/common/security/security.module.ts

import { Module, Global } from '@nestjs/common';
import { SecurityEventService } from './security-event.service';

@Global() 
@Module({
  providers: [SecurityEventService],
  exports: [SecurityEventService],
})
export class SecurityModule {}

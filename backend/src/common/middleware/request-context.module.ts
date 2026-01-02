// backend/src/common/middleware/request-context.module.ts

import { Module, Global } from '@nestjs/common';
import { RequestContextService } from './request-context.service';

@Global() 
@Module({
  providers: [RequestContextService],
  exports: [RequestContextService],
})
export class RequestContextModule {}

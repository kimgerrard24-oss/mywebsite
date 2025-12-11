// file: src/auth/local/local-refresh.module.ts

import { Module } from '@nestjs/common';
import { LocalRefreshController } from './local-refresh.controller';
import { LocalRefreshService } from './local-refresh.service';
import { SessionModule } from '../../session/session.module';

@Module({
  imports: [
    SessionModule,
  ],
  controllers: [LocalRefreshController],
  providers: [LocalRefreshService],
  exports: [LocalRefreshService],
})
export class LocalRefreshModule {}

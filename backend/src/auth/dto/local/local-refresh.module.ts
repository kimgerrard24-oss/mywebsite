// file: src/auth/local/local-refresh.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { LocalRefreshController } from './local-refresh.controller';
import { LocalRefreshService } from './local-refresh.service';
import { SessionModule } from '../../session/session.module';
import { AuthModule } from '../../auth.module';

@Module({
  imports: [
    SessionModule,
    forwardRef(() => AuthModule),  // ใช้ forwardRef เพื่อหลีกเลี่ยงปัญหาการพึ่งพากัน (circular dependencies)
  ],
  controllers: [LocalRefreshController],
  providers: [LocalRefreshService],
  exports: [LocalRefreshService],  // ทำให้ LocalRefreshService สามารถใช้งานได้จากที่อื่น ๆ
})
export class LocalRefreshModule {}


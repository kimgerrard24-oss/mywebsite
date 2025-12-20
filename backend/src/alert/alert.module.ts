// backend/src/alert/alert.module.ts

import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AlertService } from './alert.service';

/**
 * =========================================================
 * AlertModule (Global)
 * - ใช้สำหรับ Critical / Ops alert
 * - Cron / Queue / Service ใด ๆ เรียกใช้ได้
 * - ออกแบบให้ fail-soft
 * =========================================================
 */
@Global()
@Module({
  imports: [
    ConfigModule, // ใช้ env เช่น ALERT_WEBHOOK, NODE_ENV
  ],
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule {}

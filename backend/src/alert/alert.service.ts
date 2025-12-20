// backend/src/alert/alert.service.ts

import { Injectable, Logger } from '@nestjs/common';

/**
 * =========================================================
 * AlertService
 * - Centralized alert system
 * - Fail-soft (ห้าม throw)
 * - Production safe
 * =========================================================
 */
@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);

  /**
   * =========================================================
   * Critical alert
   * - ใช้กับ data loss / cleanup fail / security
   * =========================================================
   */
  async notifyCritical(
    message: string,
    context?: Record<string, any>,
  ): Promise<void> {
    try {
      const payload = {
        level: 'CRITICAL',
        message,
        context,
        env: process.env.NODE_ENV,
        service: 'backend',
        timestamp: new Date().toISOString(),
      };

      /**
       * 1️⃣ Log (always)
       */
      this.logger.error(
        `[CRITICAL] ${message}`,
        context ? JSON.stringify(context) : undefined,
      );

      /**
       * 2️⃣ Optional: Slack / Webhook
       * - ไม่บังคับ
       * - ถ้าไม่ตั้ง env → ข้าม
       */
      if (process.env.ALERT_WEBHOOK_URL) {
        await this.sendWebhook(
          process.env.ALERT_WEBHOOK_URL,
          payload,
        );
      }

      /**
       * 3️⃣ Optional: Sentry (ถ้ามี)
       * - ปล่อยให้ global filter handle
       */
    } catch (err) {
      /**
       * ❗ สำคัญมาก
       * - Alert ห้ามทำให้ระบบล้ม
       */
      this.logger.error(
        'AlertService failed (fail-soft)',
        err instanceof Error ? err.stack : undefined,
      );
    }
  }

  /**
   * =========================================================
   * Warning alert (non-blocking)
   * =========================================================
   */
  async notifyWarning(
    message: string,
    context?: Record<string, any>,
  ): Promise<void> {
    try {
      this.logger.warn(
        `[WARN] ${message}`,
        context ? JSON.stringify(context) : undefined,
      );
    } catch {
      // fail-soft
    }
  }

  /**
   * =========================================================
   * Webhook sender (Slack / Discord / Ops tool)
   * =========================================================
   */
  private async sendWebhook(
    url: string,
    payload: Record<string, any>,
  ): Promise<void> {
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `🚨 *${payload.level}*\n${payload.message}`,
          attachments: payload.context
            ? [
                {
                  color: 'danger',
                  fields: Object.entries(payload.context).map(
                    ([key, value]) => ({
                      title: key,
                      value: String(value),
                      short: true,
                    }),
                  ),
                },
              ]
            : [],
        }),
      });
    } catch (err) {
      /**
       * ❗ webhook พัง = log อย่างเดียว
       */
      this.logger.error(
        'Alert webhook failed',
        err instanceof Error ? err.stack : undefined,
      );
    }
  }
}

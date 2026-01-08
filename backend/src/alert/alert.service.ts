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
      const safeContext = this.safeSerialize(context);

      const payload = {
        level: 'CRITICAL',
        message,
        context: safeContext,
        env: process.env.NODE_ENV,
        service: 'backend',
        timestamp: new Date().toISOString(),
      };

      /**
       * 1️⃣ Log (always)
       * - ห้าม log object ตรง ๆ (กัน circular + huge payload)
       */
      this.logger.error(
        `[CRITICAL] ${message}`,
        safeContext ? JSON.stringify(safeContext) : undefined,
      );

      /**
       * 2️⃣ Optional: Slack / Webhook
       */
      if (process.env.ALERT_WEBHOOK_URL) {
        await this.sendWebhook(
          process.env.ALERT_WEBHOOK_URL,
          payload,
        );
      }

      /**
       * 3️⃣ Optional: Sentry
       * - ให้ global exception filter / interceptor handle
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
      const safeContext = this.safeSerialize(context);

      this.logger.warn(
        `[WARN] ${message}`,
        safeContext ? JSON.stringify(safeContext) : undefined,
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s hard timeout

    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          text: `🚨 *${payload.level}*\n${payload.message}`,
          attachments: payload.context
            ? [
                {
                  color: 'danger',
                  fields: Object.entries(payload.context).map(
                    ([key, value]) => ({
                      title: key,
                      value: String(value).slice(0, 500), // กัน payload ยาวผิดปกติ
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
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * =========================================================
   * Safe serializer
   * - กัน circular
   * - กัน payload ใหญ่
   * - กัน secret หลุด
   * =========================================================
   */
  private safeSerialize(
    input?: Record<string, any>,
  ): Record<string, any> | undefined {
    if (!input) return undefined;

    try {
      const seen = new WeakSet();

      const json = JSON.stringify(input, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) return '[Circular]';
          seen.add(value);
        }

        // simple secret masking
        if (
          typeof key === 'string' &&
          /token|secret|password|authorization/i.test(key)
        ) {
          return '[REDACTED]';
        }

        return value;
      });

      const parsed = JSON.parse(json);

      return parsed;
    } catch {
      return { note: 'context_unserializable' };
    }
  }
}

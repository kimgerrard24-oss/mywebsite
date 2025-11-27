// ==============================
// file: src/system-check/system-check.controller.ts
// ==============================
import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SystemCheckService } from './system-check.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('system-check')
export class SystemCheckController {
  private readonly logger = new Logger(SystemCheckController.name);

  constructor(
    private readonly systemCheck: SystemCheckService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * GET /system-check
   *
   * Returns combined system status from SystemCheckService.
   * Adds a small, non-sensitive environment summary for easier debugging in production.
   *
   * NOTE: Do not include secrets or sensitive values in this response.
   */

  @Public()
  @Get()
  async checkAll() {
    // Primary status (internal checks)
    const status = await this.systemCheck.getStatus();

    // Updated: Use R2 endpoint instead of AWS region
    const envSummary = {
      nodeEnv: this.configService.get<string>('NODE_ENV') || 'production',
      backendUrl:
        this.configService.get<string>('BACKEND_PUBLIC_URL') ||
        this.configService.get<string>('BASE_URL') ||
        null,
      allowedOrigins: (this.configService.get<string>('ALLOWED_ORIGINS') || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),

      // UPDATED: Show R2 endpoint instead of AWS region
      r2Endpoint: this.configService.get<string>('R2_ENDPOINT') || null,
    };

    // Minimal, safe logging
    this.logger.log(
      `System check requested (env=${envSummary.nodeEnv}, r2Endpoint=${envSummary.r2Endpoint})`,
    );

    return {
      status,
      env: envSummary,
    };
  }
}

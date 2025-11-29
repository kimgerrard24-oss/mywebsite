// ==============================
// file: src/system-check/system-check.controller.ts
// ==============================
import { Controller, Get, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SystemCheckService } from './system-check.service';
import { Public } from '../auth/decorators/public.decorator';

// ป้องกันไม่ให้โดน Rate-Limit ทั้งหมด
import { RateLimitIgnore } from '../common/rate-limit/rate-limit.decorator';

@Controller('system-check')
@RateLimitIgnore()   // ← เพิ่มที่ระดับ Controller (จำเป็น)
export class SystemCheckController {
  private readonly logger = new Logger(SystemCheckController.name);

  constructor(
    private readonly systemCheck: SystemCheckService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @RateLimitIgnore()  // ← คงไว้เพื่อกัน fallback
  @Get()
  async checkAll() {
    const status = await this.systemCheck.getStatus();

    const envSummary = {
      nodeEnv:
        this.configService.get<string>('NODE_ENV') ||
        process.env.NODE_ENV ||
        null,

      backendUrl:
        this.configService.get<string>('BACKEND_PUBLIC_URL') ||
        this.configService.get<string>('BASE_URL') ||
        null,
    };

    this.logger.log(
      `System check requested (env=${envSummary.nodeEnv})`,
    );

    return {
      status,
      env: envSummary,
    };
  }
}

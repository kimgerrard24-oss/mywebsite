// ==============================
// file: src/system-check/system-check.controller.ts
// ==============================
import { Controller, Get, Logger } from '@nestjs/common';
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

  @Public()
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

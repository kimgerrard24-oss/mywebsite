import { Controller, Get } from '@nestjs/common';
import { RateLimitContext } from 'src/common/rate-limit/rate-limit.decorator';

@Controller('test-rate')
export class TestRateController {
  @Get()
  @RateLimitContext('postCreate') // ใช้ policy จริงตามระบบของคุณ
  testRate() {
    return {
      ok: true,
      message: 'Rate test OK',
    };
  }
}

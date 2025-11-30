import { Controller, Get } from '@nestjs/common';
import { RateLimitContext } from '../../common/rate-limit/rate-limit.decorator';

@Controller('test-rate')
export class TestRateController {
  @Get()
  @RateLimitContext('postCreate')
  testRate() {
    return {
      ok: true,
      message: 'Rate test OK',
    };
  }
}

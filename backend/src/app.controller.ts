import { Controller, Get } from '@nestjs/common';

@Controller('api') // <--- root path
export class AppController {
  @Get('hello') // <--- จะได้ path เต็ม = /api/hello
  getHello(): string {
    return 'Hello from NestJS 👋';
  }

  @Get('health')
  getHealth(): object {
    return { status: 'ok', message: 'NestJS backend is healthy ✅' };
  }
}

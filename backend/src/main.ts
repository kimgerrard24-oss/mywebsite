import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // เปลี่ยนพอร์ต backend จาก 3000 → 4000
  const PORT = process.env.PORT || 4000;

  await app.listen(PORT);
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
}
void bootstrap();

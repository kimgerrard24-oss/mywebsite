import { Module } from '@nestjs/common';
import { TestRateController } from './test.controller';

@Module({
  controllers: [TestRateController],
})
export class TestRateModule {}

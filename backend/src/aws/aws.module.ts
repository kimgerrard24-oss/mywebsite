// ==============================
// file: src/aws/aws.module.ts
// ==============================
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AwsService } from './aws.service';

@Module({
  imports: [
    // Import ConfigModule so environment variables are available when AwsService is instantiated.
    // AppModule may already import ConfigModule globally — importing it here is safe and idempotent.
    ConfigModule,
  ],
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule {}

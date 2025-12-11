import { Module, forwardRef } from '@nestjs/common';
import { LocalRefreshController } from './local-refresh.controller';
import { LocalRefreshService } from './local-refresh.service';
import { SessionModule } from '../../session/session.module';
import { AuthModule } from '../../auth.module';

@Module({
  imports: [
    SessionModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [LocalRefreshController],
  providers: [LocalRefreshService],
  exports: [LocalRefreshService],
})
export class LocalRefreshModule {}

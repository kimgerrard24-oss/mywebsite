// src/r2/r2.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { R2Service } from './r2.service';
import { R2DeleteService } from './r2-delete.service';

@Module({
  imports: [
    ConfigModule,
  ],

  providers: [R2Service, R2DeleteService,],
  exports: [R2Service, R2DeleteService,],
})
export class R2Module {}

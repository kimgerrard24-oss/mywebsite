// src/auth/password-reset.controller.ts

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { PasswordResetService } from './password-reset.service';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
// ถ้าคุณมี decorator @Public() สำหรับ bypass auth ให้ import มาใช้งาน
// import { Public } from '../auth/decorators/public.decorator';

@Controller('auth/local')
export class PasswordResetController {
  constructor(
    private readonly passwordResetService: PasswordResetService,
  ) {}

  // @Public() // ถ้าต้องการให้ route นี้ไม่ต้อง auth ให้ uncomment
  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() body: RequestPasswordResetDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      undefined;
    const userAgent = req.headers['user-agent'] as string | undefined;

    await this.passwordResetService.requestPasswordReset(
      body.email,
      ip,
      userAgent,
    );

    // ไม่บอกว่า email นี้มีอยู่หรือไม่ เพื่อลด user enumeration
    return {
      message:
        'If an account exists for this email, a password reset link has been sent.',
    };
  }
}

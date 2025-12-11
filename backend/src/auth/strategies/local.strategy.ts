// src/auth/strategies/local.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import * as emailValidator from 'email-validator'; // นำเข้าช่วยตรวจสอบรูปแบบ email

@Injectable()
export class LocalStrategy {
  constructor(private readonly authService: AuthService) {}

  // Returns user object (without sensitive fields) on success, or throws UnauthorizedException
  async validate(email: string, password: string) {
    // ตรวจสอบรูปแบบของ email
    if (!emailValidator.validate(email)) {
      throw new UnauthorizedException('Invalid email format');
    }

    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // ตรวจสอบว่าเราไม่ส่งข้อมูลที่ละเอียดอ่อน
    const { hashedPassword, ...userWithoutSensitiveData } = user;

    return userWithoutSensitiveData;
  }
}


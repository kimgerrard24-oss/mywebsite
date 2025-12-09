// file: src/auth/password-reset.policy.ts

import { BadRequestException } from '@nestjs/common';

export function validatePasswordStrength(password: string): void {
  // กติกาง่าย ๆ ระดับ production baseline:
  // - อย่างน้อย 8 ตัว (ตรวจซ้ำจาก DTO แล้ว)
  // - ต้องมีตัวเลขอย่างน้อย 1 ตัว
  // - ต้องมีตัวอักษรตัวเล็กอย่างน้อย 1 ตัว
  // - ต้องมีตัวอักษรตัวใหญ่อย่างน้อย 1 ตัว
  // - ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว

  const hasNumber = /[0-9]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (!hasNumber || !hasLower || !hasUpper || !hasSymbol) {
    throw new BadRequestException(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol.',
    );
  }
}

// file: src/auth/password-reset.policy.ts

import { BadRequestException } from '@nestjs/common';

/**
 * Production baseline password policy
 *
 * Rules:
 * - minimum length 8
 * - at least 1 lowercase
 * - at least 1 uppercase
 * - at least 1 digit
 * - at least 1 symbol
 *
 * IMPORTANT:
 * - Do NOT reveal which rule failed (anti brute-force enumeration)
 * - DTO validation alone is NOT sufficient
 */
export function validatePasswordStrength(
  rawPassword: string,
): void {
  if (typeof rawPassword !== 'string') {
    throw new BadRequestException(
      'Invalid password format.',
    );
  }

  const password = rawPassword.normalize('NFKC');

  // length
  if (password.length < 8) {
    throw new BadRequestException(
      'Password does not meet security requirements.',
    );
  }

  let hasLower = false;
  let hasUpper = false;
  let hasDigit = false;
  let hasSymbol = false;

  for (const ch of password) {
    if (ch >= 'a' && ch <= 'z') hasLower = true;
    else if (ch >= 'A' && ch <= 'Z') hasUpper = true;
    else if (ch >= '0' && ch <= '9') hasDigit = true;
    else hasSymbol = true;
  }

  if (!(hasLower && hasUpper && hasDigit && hasSymbol)) {
    throw new BadRequestException(
      'Password does not meet security requirements.',
    );
  }
}


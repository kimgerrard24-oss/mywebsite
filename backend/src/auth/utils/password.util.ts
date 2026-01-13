// backend/src/auth/utils/password.util.ts

import * as argon2 from 'argon2';

const TIME_COST = Number(process.env.ARGON2_TIME_COST) || 3;
const MEMORY_COST = Number(process.env.ARGON2_MEMORY_COST) || 1 << 16; // 65536 KiB (64 MiB)
const PARALLELISM = Number(process.env.ARGON2_PARALLELISM) || 1;

const argon2Options: argon2.Options & { raw?: boolean } = {
  type: argon2.argon2id,
  timeCost: TIME_COST,
  memoryCost: MEMORY_COST,
  parallelism: PARALLELISM,
};

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 2,
  });
}

export async function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  try {
    // argon2.verify checks hash and is safe against timing attacks
    return await argon2.verify(hashed, plain);
  } catch (err) {
    // If verify throws (e.g., malformed hash), treat as non-match
    return false;
  }
}
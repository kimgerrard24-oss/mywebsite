// ==============================================
// file: src/auth/firebase-auth.guard.ts
// ==============================================

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { FirebaseAdminService } from '../firebase/firebase.service';
import type { Request } from 'express';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(
    private readonly firebase: FirebaseAdminService,
  ) {}

  /**
   * 🔒 Guard นี้ใช้เฉพาะกับ:
   * POST /auth/complete
   *
   * หน้าที่:
   * - verify Firebase ID token
   * - attach decoded token ให้ controller ใช้
   *
   * ❗ ไม่ใช่ session authority
   * ❗ ไม่ set req.user
   * ❗ ไม่เกี่ยวกับ JWT / Redis
   */
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<
      Request & { firebaseUser?: any }
    >();

    const idToken = req.body?.idToken;

    if (!idToken || typeof idToken !== 'string') {
      throw new UnauthorizedException(
        'Missing Firebase ID token',
      );
    }

    try {
      const decoded =
        await this.firebase.auth().verifyIdToken(idToken);

      // ✅ attach only for this request
      // controller จะเอาไป map → local user → create Redis session
      req.firebaseUser = decoded;

      return true;
    } catch (err) {
      this.logger.warn(
        'Firebase ID token verification failed',
      );
      throw new UnauthorizedException(
        'Invalid Firebase ID token',
      );
    }
  }
}

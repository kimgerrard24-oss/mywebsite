//  backend/src/auth/firebase.service.ts
import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FIREBASE_ADMIN } from './firebase-admin.provider';

@Injectable()
export class FirebaseService implements OnModuleDestroy {
  private readonly logger = new Logger(FirebaseService.name);
  constructor(@Inject(FIREBASE_ADMIN) private readonly app: admin.app.App) {}

  getAuth() {
    return this.app.auth();
  }

  async verifyIdToken(idToken: string) {
    try {
      // checkRevoked false by default; set true if you want to enforce revocation checks
      const decoded = await this.app.auth().verifyIdToken(idToken, /*checkRevoked=*/ false);
      return decoded;
    } catch (err) {
      this.logger.warn('verifyIdToken failed: ' + (err as Error).message);
      throw err;
    }
  }

  async getUser(uid: string) {
    return this.app.auth().getUser(uid);
  }

  async onModuleDestroy() {
    try {
      await this.app.delete();
    } catch (e) {
      this.logger.warn('Failed to delete firebase app: ' + (e as Error).message);
    }
  }
}

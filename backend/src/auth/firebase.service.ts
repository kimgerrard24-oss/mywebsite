//  backend/src/auth/firebase.service.ts

import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FIREBASE_ADMIN } from './firebase-admin.provider';

@Injectable()
export class FirebaseAdminService implements OnModuleDestroy {
  private readonly logger = new Logger(FirebaseAdminService.name);

  constructor(
    @Inject(FIREBASE_ADMIN)
    private readonly app: admin.app.App,
  ) {}

  getAuth() {
    return this.app.auth();
  }

  async verifyIdToken(idToken: string) {
    if (!idToken || typeof idToken !== 'string') {
      throw new Error('Invalid ID token');
    }

    try {
      const decoded = await this.app
        .auth()
        .verifyIdToken(idToken, false); // checkRevoked = false

      return decoded;
    } catch (err) {
      this.logger.warn('verifyIdToken failed: ' + (err as Error).message);
      throw err;
    }
  }

  async getUser(uid: string) {
    if (!uid) {
      throw new Error('Invalid UID');
    }
    return this.app.auth().getUser(uid);
  }

  async onModuleDestroy() {
    try {
      await this.app.delete();
    } catch (e) {
      this.logger.warn(
        'Failed to delete firebase app: ' + (e as Error).message,
      );
    }
  }
}

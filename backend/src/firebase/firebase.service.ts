// ==========================================
// file: src/firebase/firebase.service.ts
// ==========================================

import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseAdminService {
  private readonly logger = new Logger(FirebaseAdminService.name);
  public admin!: admin.app.App;

  constructor() {
    this.admin = this.initializeFirebase();
  }

  private initializeFirebase(): admin.app.App {
    const base64 = (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || '').trim();
    const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();

    try {
      // If there is already an initialized app, reuse it (important for hot-reload / tests)
      if (admin.apps && admin.apps.length > 0) {
        this.logger.log('Reusing existing Firebase admin app');
        return admin.app();
      }

      // 1) Try base64-encoded service account
      if (base64.length > 0) {
        try {
          const decoded = Buffer.from(base64, 'base64').toString('utf8');

          // Basic sanity checks (do not log the content)
          if (!decoded.includes('"private_key"') || !decoded.includes('"client_email"')) {
            throw new Error('Decoded base64 Firebase credential appears invalid');
          }

          const creds = JSON.parse(decoded);

          if (!creds.private_key || !creds.client_email) {
            throw new Error('Service account JSON is missing required fields');
          }

          // Convert escaped newline sequences to real newlines if necessary
          if (typeof creds.private_key === 'string' && creds.private_key.includes('\\n')) {
            creds.private_key = creds.private_key.replace(/\\n/g, '\n');
          }

          const app = admin.initializeApp({
            credential: admin.credential.cert(creds),
          });

          this.logger.log('Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT_BASE64');
          return app;
        } catch (e: any) {
          // Don't expose credential contents in logs; log only that base64 parsing failed
          this.logger.error('Failed to initialize Firebase from base64 service account: ' + (e?.message ?? 'unknown'));
          // fall-through to try file path or default credentials
        }
      }

      // 2) Try service account file path
      if (filePath) {
        try {
          const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
          if (!fs.existsSync(resolved)) {
            throw new Error('Service account file not found at provided path');
          }

          const raw = fs.readFileSync(resolved, 'utf8');
          const creds = JSON.parse(raw);

          if (!creds.private_key || !creds.client_email) {
            throw new Error('Service account file missing required fields');
          }

          if (typeof creds.private_key === 'string' && creds.private_key.includes('\\n')) {
            creds.private_key = creds.private_key.replace(/\\n/g, '\n');
          }

          const app = admin.initializeApp({
            credential: admin.credential.cert(creds),
          });

          this.logger.log(`Firebase Admin initialized from file: ${resolved}`);
          return app;
        } catch (e: any) {
          this.logger.error('Failed to initialize Firebase from file path: ' + (e?.message ?? 'unknown'));
          // fall-through to default credentials
        }
      }

      // 3) Try default credentials (GCP metadata, environment, instance role)
      try {
        const app = admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
        this.logger.log('Firebase Admin initialized using application default credentials');
        return app;
      } catch (e: any) {
        // applicationDefault may fail if no metadata/ADC available — will be handled below
        this.logger.debug('applicationDefault() failed: ' + (e?.message ?? 'unknown'));
      }

      // If we reach here, no credential method worked — fail fast with a clear error
      throw new Error(
        'Firebase credentials not configured. Set FIREBASE_SERVICE_ACCOUNT_BASE64 or FIREBASE_SERVICE_ACCOUNT_PATH, or ensure application default credentials are available.',
      );
    } catch (err: any) {
      // If another app exists, prefer that instead of throwing
      if (admin.apps && admin.apps.length > 0) {
        this.logger.warn('Firebase initialization encountered an error but existing app is available; reusing existing app');
        return admin.app();
      }

      // Bubble up an informative error (without exposing secrets)
      this.logger.error('Firebase initialization failed: ' + (err?.message ?? 'unknown'));
      throw err;
    }
  }

  /**
   * Convenience wrapper to access auth methods. Keeps typing consistent.
   */
  public auth(): admin.auth.Auth {
    return this.admin.auth();
  }
}

//  backend/src/auth/firebase-admin.provider.ts
import { Provider } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN_APP';

export interface FirebaseInitOptions {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
  secretArn?: string;
}

async function loadCredsFromAws(secretArn: string) {
  try {
    const client = new SecretsManagerClient({});
    const cmd = new GetSecretValueCommand({ SecretId: secretArn });
    const res = await client.send(cmd);

    if (!res.SecretString) {
      throw new Error('Secret did not contain SecretString');
    }

    return JSON.parse(res.SecretString);
  } catch (err) {
    throw new Error('Failed to load Firebase credentials from AWS Secrets Manager');
  }
}

export const firebaseAdminProvider: Provider = {
  provide: FIREBASE_ADMIN,
  useFactory: async (): Promise<admin.app.App> => {
    const secretArn = process.env.FIREBASE_SECRET_ARN;
    let creds: { project_id?: string; client_email?: string; private_key?: string } = {};

    if (secretArn) {
      creds = await loadCredsFromAws(secretArn);
    } else {
      creds = {
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY,
      };
    }

    if (!creds.project_id || !creds.client_email || !creds.private_key) {
      throw new Error('Missing Firebase credentials. Set FIREBASE_* env vars or FIREBASE_SECRET_ARN.');
    }

    // Support base64 private key
    let rawPrivateKey = creds.private_key;
    if (rawPrivateKey.trim().startsWith('{') === false && rawPrivateKey.includes('\\n') === false) {
      try {
        rawPrivateKey = Buffer.from(rawPrivateKey, 'base64').toString('utf8');
      } catch {}
    }

    const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

    // Use a singleton Firebase app
    const existingApp = admin.apps?.find((a) => a?.name === 'phlyphant-main');
    if (existingApp) {
      return existingApp;
    }

    return admin.initializeApp(
      {
        credential: admin.credential.cert({
          projectId: creds.project_id,
          clientEmail: creds.client_email,
          privateKey,
        } as admin.ServiceAccount),
      },
      'phlyphant-main',
    );
  },
};

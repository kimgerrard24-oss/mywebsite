// backend/src/auth/firebase-admin.provider.ts
import { Provider } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN_APP';

export interface FirebaseInitOptions {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
  secretArn?: string; // optional: AWS Secrets Manager ARN
}

async function loadCredsFromAws(secretArn: string) {
  const client = new SecretsManagerClient({});
  const cmd = new GetSecretValueCommand({ SecretId: secretArn });
  const res = await client.send(cmd);
  if (!res.SecretString) throw new Error('Secret did not contain SecretString');
  return JSON.parse(res.SecretString);
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

    // Fix newline escaping (common when storing private key in env)
    const privateKey = creds.private_key.replace(/\\n/g, '\n');

    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: creds.project_id,
        clientEmail: creds.client_email,
        privateKey,
      } as admin.ServiceAccount),
    }, `phlyphant-${Math.random().toString(36).slice(2, 8)}`);

    return app;
  },
};

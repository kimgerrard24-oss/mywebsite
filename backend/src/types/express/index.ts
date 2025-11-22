// backend/src/types/express/index.d.ts

declare global {
  namespace Express {
    interface User {
      uid?: string;
      email?: string;
      provider?: string;
      firebaseUid?: string;
      [key: string]: any;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};

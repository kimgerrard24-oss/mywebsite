// ==========================================
// file: src/firebase/firebase.module.ts
// ==========================================

import { Module, Global, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseAdminService } from './firebase.service';

@Global()
@Module({
  imports: [
    // Ensure environment variables (.env.production) are available
    ConfigModule,
  ],
  providers: [
    {
      provide: FirebaseAdminService,
      useFactory: () => {
        const logger = new Logger('FirebaseAdminModule');

        // Validate required env for production
        if (process.env.NODE_ENV === 'production') {
          logger.log('Initializing FirebaseAdminService in production mode');

          if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
            logger.error(
              'FIREBASE_SERVICE_ACCOUNT_BASE64 is missing. Firebase Admin cannot initialize in production.'
            );
          }
        }

        // Initialize Firebase using the service that already performs full validation
        return new FirebaseAdminService();
      },
    },
  ],
  exports: [FirebaseAdminService],
})
export class FirebaseAdminModule {}

// ==========================================
// file: backend/src/secrets/secrets.module.ts
// ==========================================

import { Global, Module, Logger } from '@nestjs/common';
import { SecretsService } from './secrets.service';

@Global()
@Module({
  providers: [
    {
      provide: SecretsService,
      useFactory: async () => {
        const logger = new Logger('SecretsModule');

        // Basic validation for Production
        if (process.env.NODE_ENV === 'production') {
          if (!process.env.GOOGLE_CLIENT_ID) {
            logger.warn(
              'GOOGLE_CLIENT_ID missing in environment. Will attempt to load from AWS Secrets Manager.'
            );
          }
          if (!process.env.FACEBOOK_CLIENT_ID) {
            logger.warn(
              'FACEBOOK_CLIENT_ID missing in environment. Will attempt to load from AWS Secrets Manager.'
            );
          }
        }

        const service = new SecretsService();

        // Auto-load OAuth secrets from AWS unless disabled
        const disabled = process.env.DISABLE_AWS_SECRET === 'true';

        if (!disabled) {
          try {
            await service.getOAuthSecrets();
            logger.log('OAuth secrets loaded successfully from AWS.');
          } catch (err) {
            logger.error(
              `Failed to load OAuth secrets from AWS: ${(err as Error).message}`
            );
          }
        } else {
          logger.warn(
            'DISABLE_AWS_SECRET=true → using only .env.production without AWS fallback.'
          );
        }

        return service;
      },
    },
  ],
  exports: [SecretsService],
})
export class SecretsModule {}

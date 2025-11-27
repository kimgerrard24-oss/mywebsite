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

        // Auto-load AWS unless disabled manually
        const disableAWS = process.env.DISABLE_AWS_SECRET === 'true';

        // NEW: unified secret name detection (fix unhealthy)
        const secretName =
          process.env.AWS_OAUTH_SECRET_NAME ||
          process.env.AWS_SECRET_NAME ||
          '';

        if (!disableAWS && secretName.trim() !== '') {
          try {
            await service.getOAuthSecrets();
            logger.log(
              `OAuth secrets loaded successfully from AWS (Secret="${secretName}")`
            );
          } catch (err) {
            logger.error(
              `Failed to load OAuth secrets from AWS: ${(err as Error).message}`
            );
          }
        } else if (!disableAWS && secretName.trim() === '') {
          // NEW: prevents false "unhealthy" on system-check
          logger.warn(
            'AWS secret name missing → skip AWS Secrets Manager. Using only environment variables.'
          );
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

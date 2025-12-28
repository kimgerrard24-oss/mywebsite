// ==========================================
// file: backend/src/socket/socket.module.ts
// ==========================================

import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { FirebaseAdminService } from '../firebase/firebase.service';
import { SecretsModule } from '../secrets/secrets.module';

@Module({
  imports: [
    SecretsModule, // required for OAuth + Firebase Admin in production
  ],
  providers: [
    SocketGateway,
    FirebaseAdminService, // required for session cookie verification
  ],
  exports: [
    SocketGateway,
  ],
})
export class SocketModule {}

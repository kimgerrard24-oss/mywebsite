// backend/src/common/middleware/request-context.service.ts

import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export type RequestContextData = {
  user?: {
    userId: string;
    jti: string;
  };
  ip?: string;
};

@Injectable()
export class RequestContextService {
  private readonly als =
    new AsyncLocalStorage<RequestContextData>();

  run(
    data: RequestContextData,
    fn: () => Promise<any>,
  ) {
    return this.als.run(data, fn);
  }

  getUser() {
    return this.als.getStore()?.user ?? null;
  }

  getIp() {
    return this.als.getStore()?.ip ?? null;
  }
  
}

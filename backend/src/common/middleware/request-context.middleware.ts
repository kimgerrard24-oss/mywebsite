// backend/src/common/middleware/request-context.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContextService } from './request-context.service';

@Injectable()
export class RequestContextMiddleware
  implements NestMiddleware
{
  constructor(
    private readonly ctx: RequestContextService,
  ) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const user = (req as any).user ?? null;

    this.ctx.run(
      {
        user,
        ip: req.ip,
      },
      async () => next(),
    );
  }
}

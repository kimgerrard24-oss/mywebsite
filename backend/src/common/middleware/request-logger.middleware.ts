// backend/src/common/middleware/request-logger.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
const logger = new Logger('HTTP');

@Injectable()
export class RequestLogger implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      logger.log(JSON.stringify({
        event: 'HTTP_REQUEST',
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: ms,
        ip: req.ip,
        ua: req.headers['user-agent'],
      }));
    });
    next();
  }
}

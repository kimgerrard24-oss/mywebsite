// backend/src/common/middleware/request-logger.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const logger = new Logger('HTTP');

function getRealIp(req: Request): string {
  // 1) Cloudflare / Nginx / Caddy forwarded IP
  const forwarded = req.headers['x-forwarded-for'];

  if (typeof forwarded === 'string') {
    // ใช้ตัวแรก (คือต้นทางจริง)
    return forwarded.split(',')[0].trim();
  }

  // 2) Fallback ของ Express
  return req.ip || '';
}

@Injectable()
export class RequestLogger implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const realIp = getRealIp(req);

    res.on('finish', () => {
      const ms = Date.now() - start;

      logger.log(
        JSON.stringify({
          event: 'HTTP_REQUEST',
          method: req.method,
          path: req.originalUrl,
          status: res.statusCode,
          durationMs: ms,
          ip: realIp,
          ua: req.headers['user-agent'],
        }),
      );
    });

    next();
  }
}

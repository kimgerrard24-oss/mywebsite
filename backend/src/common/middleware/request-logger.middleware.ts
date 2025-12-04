// backend/src/common/middleware/request-logger.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const logger = new Logger('HTTP');

function getRealIp(req: Request): string {
  // Cloudflare
  if (req.headers['cf-connecting-ip']) {
    return String(req.headers['cf-connecting-ip']).split(',')[0].trim();
  }

  // x-forwarded-for chain
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim();
  }

  // x-real-ip (nginx / traefik)
  if (req.headers['x-real-ip']) {
    return String(req.headers['x-real-ip']).trim();
  }

  // Socket direct
  const ip =
    (req.socket && req.socket.remoteAddress) ||
    req.ip ||
    '';

  let normalized = String(ip).trim();

  // Remove IPv6 mapped prefix
  normalized = normalized.replace(/^::ffff:/, '');

  // Remove port if present
  normalized = normalized.replace(/:\d+$/, '');

  return normalized;
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

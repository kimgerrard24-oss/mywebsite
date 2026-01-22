// backend/src/users/privacy/users-privacy.controller.ts

import {
  Controller,
  Patch,
  Header,
  Body,
  UnauthorizedException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';
import { UsersPrivacyService } from './users-privacy.service';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';

@Controller('users/me/privacy')
export class UsersPrivacyController {
  constructor(
    private readonly privacyService: UsersPrivacyService,
  ) {}

  @Patch()
@UseGuards(AccessTokenCookieAuthGuard)
@RateLimit('updatePrivacy')
@Header(
  'Cache-Control',
  // absolutely no caching at any layer
  'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
)
@Header('Pragma', 'no-cache') // legacy proxies
@Header('Expires', '0')
@Header('Surrogate-Control', 'no-store') // some CDNs
@Header('Vary', 'Cookie, Authorization') // prevent shared cache cross-user
async updateMyPrivacy(
  @Req() req: Request & { user?: { userId: string; jti: string } },
  @Body() dto: UpdatePrivacyDto,
) {
  const userId = req.user?.userId;

  // defense-in-depth (guard should already block)
  if (!userId) {
    throw new UnauthorizedException('Authentication required');
  }

  return this.privacyService.updateMyPrivacy({
    userId,
    isPrivate: dto.isPrivate,
    ip: req.ip,
    userAgent:
      typeof req.headers['user-agent'] === 'string'
        ? req.headers['user-agent']
        : undefined,
  });
}

}

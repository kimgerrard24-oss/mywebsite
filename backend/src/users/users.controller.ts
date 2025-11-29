//  file: backend/src/users/users.controller.ts
import { Controller, Post, Body, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { FirebaseAdminService } from '../firebase/firebase.service';
import * as cookie from 'cookie';

@Controller('test-users')
export class UsersTestController {
  constructor(private readonly firebase: FirebaseAdminService) {}

  @Post()
  async create(@Body() dto: CreateUserDto, @Req() req: Request) {
    const cookieName = process.env.SESSION_COOKIE_NAME || 'session';
    let sessionToken: string | undefined;

    // Parse cookies
    if (req.headers.cookie) {
      const parsed = cookie.parse(req.headers.cookie);
      sessionToken = parsed[cookieName];
    }

    // Fallback: Bearer token
    if (!sessionToken && req.headers.authorization?.startsWith('Bearer ')) {
      sessionToken = req.headers.authorization.replace('Bearer ', '');
    }

    if (!sessionToken) {
      throw new UnauthorizedException('Missing authentication token');
    }

    // Verify Firebase session cookie
    try {
      await this.firebase.auth().verifySessionCookie(sessionToken, true);
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }

    return {
      message: 'DTO Passed Validation',
      data: dto,
    };
  }
}

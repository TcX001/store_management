// jwt-refresh.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
// Import UnauthorizedException to handle the error case
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }


  validate(req: Request, payload: any) {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const refreshToken = authHeader.replace('Bearer', '').trim();

    return { ...payload, refreshToken };
  }
}
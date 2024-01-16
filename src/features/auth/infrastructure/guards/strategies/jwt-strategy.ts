import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthUserService } from '../../../application/auth-user.service';

type JwtPayload = {
  sub: string;
  username: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.jwt_access_secret,
    });
  }

  async validate(payload: JwtPayload) {
    return payload.sub;
  }
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: jwtConstants.refresh_secret,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.headers.cookie?.split('=')[1];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    return { ...payload, refreshToken };
  }
}

const cookieExtractor = (request: Request): string | null => {
  const refreshToken = request.headers.cookie?.split('=')[1];
  return refreshToken!;
};

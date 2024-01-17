import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SecurityQueryRepo } from 'src/features/security/api/query-repositories/security.query.repo';
import { AuthService } from 'src/infra/application/auth.service';
import { jwtConstants } from '../constants';

type JwtPayload = {
  sub: string;
  username: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.jwt_access_secret,
    });
  }

  async validate(payload: JwtPayload) {
    return payload;
  }
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private securityQueryRepo: SecurityQueryRepo) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: jwtConstants.refresh_secret,
    });
  }

  async validate(req: Request, payload: any) {
    const { iat, deviceId } = payload;

    const tokenIssuedAt = new Date(iat * 1000).toISOString();

    const userSession = await this.securityQueryRepo.getUserSession(deviceId);

    if (!userSession || tokenIssuedAt !== userSession.lastActiveDate) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return { ...payload };
  }
}

const cookieExtractor = (request: Request): string => {
  return request.headers.cookie?.split('=')[1] as string;
};

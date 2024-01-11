import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import settings from '../settings/jwt.settings';
import { JwtService } from '../application/jwt-service';

@Injectable()
export class AuthBearerGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { authorization } = context.switchToHttp().getRequest().headers;

    if (!authorization) {
      throw new UnauthorizedException('Unauthorized');
    }

    const [authType, authToken] = authorization.split(' ');

    if (authType !== 'Bearer' || !authToken) {
      throw new UnauthorizedException('Invalid token type or token missing');
    }

    const describeToken = {
      token: authToken,
      secret: settings.jwt_secret,
      tokenType: authType,
    };

    try {
      const foundUser = await this.jwtService.getUserInfoByToken(describeToken);

      if (!foundUser) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      //   request.user = foundUser;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthBasicGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { authorization } = context.switchToHttp().getRequest().headers;

    if (!authorization) {
      throw new UnauthorizedException('Unauthorized');
    }

    const [authType, authValue] = authorization.split(' ');

    if (authType !== 'Basic' || authValue !== 'YWRtaW46cXdlcnR5') {
      throw new UnauthorizedException('Unauthorized');
    }

    return true;
  }
}

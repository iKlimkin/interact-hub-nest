import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthUserService, UserIdType } from '../../../application/auth.service';
import { OutputId } from 'src/infra/likes.types';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authUserService: AuthUserService) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<UserIdType> {
    const userId = await this.authUserService.checkCredentials({
      loginOrEmail,
      password,
    });
    
    if (!userId) {
      throw new UnauthorizedException();
    }

    return userId;
  }
}

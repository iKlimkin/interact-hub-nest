import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserIdType } from '../../../../admin/api/models/outputSA.models.ts/user-models';
import { CheckCredentialsCommand } from '../../../application/use-cases/check-credentials.use-case';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private commandBus: CommandBus) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<UserIdType> {
    const userId = await this.commandBus.execute(
      new CheckCredentialsCommand({
        loginOrEmail,
        password,
      }),
    );

    if (!userId) {
      throw new UnauthorizedException();
    }

    return userId;
  }
}

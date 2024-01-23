import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserIdType } from '../../../../admin/api/models/outputSA.models.ts/user-models';
import { CheckCredentialsCommand } from '../../../application/use-cases/commands/check-credentials.command';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private commandBus: CommandBus) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<UserIdType> {
    
    const command = new CheckCredentialsCommand({
      loginOrEmail,
      password,
    });

    const userId = await this.commandBus.execute(command);

    if (!userId) {
      throw new UnauthorizedException();
    }

    return userId;
  }
}

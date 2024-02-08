import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PassportStrategy } from '@nestjs/passport';
import { ValidationError, validateOrReject } from 'class-validator';
import { Strategy } from 'passport-local';
import { UserIdType } from '../../../../admin/api/models/outputSA.models.ts/user-models';
import { InputCredentialsModel } from '../../../api/models/auth-input.models.ts/input-credentials.model';
import { CheckCredentialsCommand } from '../../../application/use-cases/commands/check-credentials.command';
import { CheckCredentialsSQLCommand } from '../../../application/use-cases/commands/check-credentials-sql.command';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private commandBus: CommandBus) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<UserIdType> {
    await this.validateInputModel(loginOrEmail, password);

    const command = new CheckCredentialsCommand({
      loginOrEmail,
      password,
    });

    const sqlCommand = new CheckCredentialsSQLCommand({
      loginOrEmail,
      password,
    });

    const userId = await this.commandBus.execute(command);
    const sqlUserAccount = await this.commandBus.execute(sqlCommand);

    if (!userId && !sqlUserAccount) {
      throw new UnauthorizedException();
    }

    return userId ? userId : sqlUserAccount;
  }

  private async validateInputModel(loginOrEmail: string, password: string) {
    const validation = new InputCredentialsModel();
    validation.loginOrEmail = loginOrEmail;
    validation.password = password;
    try {
      await validateOrReject(validation);
    } catch (errors) {
      await this.handleValidationErrors(errors);
    }
  }

  private async handleValidationErrors(
    errors: ValidationError[],
  ): Promise<void> {
    const errorResponse: any = {
      message: [],
    };

    for (const error of errors) {
      const constraints = Object.values(error.constraints || {});

      for (const constraint of constraints) {
        errorResponse.message.push({
          field: error.property,
          message: constraint.trim(),
        });
      }
    }
    throw new BadRequestException(errorResponse);
  }
}

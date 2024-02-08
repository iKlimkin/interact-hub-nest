import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BcryptAdapter } from '../../../../infra/adapters/bcrypt-adapter';
import { validateOrRejectModel } from '../../../../infra/validators/validate-or-reject.model';
import { UserIdType } from '../../../admin/api/models/outputSA.models.ts/user-models';
import { AuthUsersSQLRepository } from '../../infrastructure/auth-users.sql-repository';
import { CheckCredentialsSQLCommand } from './commands/check-credentials-sql.command';
import { CheckCredentialsCommand } from './commands/check-credentials.command';

@CommandHandler(CheckCredentialsSQLCommand)
export class CheckCredentialsSQLUseCase
  implements ICommandHandler<CheckCredentialsCommand>
{
  constructor(
    private authUsersSQLRepository: AuthUsersSQLRepository,
    private bcryptAdapter: BcryptAdapter,
  ) {}

  async execute(
    command: CheckCredentialsSQLCommand,
  ): Promise<UserIdType | null> {
    await validateOrRejectModel(command, CheckCredentialsSQLCommand);

    const user = await this.authUsersSQLRepository.findByLoginOrEmail({
      loginOrEmail: command.inputData.loginOrEmail,
    });

    if (!user) return null;

    const validPassword = await this.bcryptAdapter.compareAsync(
      command.inputData.password,
      user.password_hash,
    );

    if (!validPassword) return null;

    return {
      userId: user.id,
    };
  }
}

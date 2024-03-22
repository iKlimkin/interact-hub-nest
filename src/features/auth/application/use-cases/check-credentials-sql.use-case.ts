import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BcryptAdapter } from '../../../../infra/adapters/bcrypt-adapter';
import { validateOrRejectModel } from '../../../../infra/validators/validate-or-reject.model';
import { UserIdType } from '../../../admin/api/models/outputSA.models.ts/user-models';
import { AuthUsersSqlRepository } from '../../infrastructure/auth-users.sql-repository';
import { CheckCredentialsSQLCommand } from './commands/check-credentials-sql.command';
import { CheckCredentialsCommand } from './commands/check-credentials.command';
import { AuthUsersTORRepository } from '../../infrastructure/auth-users.tor-repository';

@CommandHandler(CheckCredentialsSQLCommand)
export class CheckCredentialsSQLUseCase
  implements ICommandHandler<CheckCredentialsCommand>
{
  constructor(
    private authUsersSqlRepository: AuthUsersSqlRepository,
    private authRepo: AuthUsersTORRepository,
    private bcryptAdapter: BcryptAdapter,
  ) {}

  async execute(
    command: CheckCredentialsSQLCommand,
  ): Promise<UserIdType | null> {
    await validateOrRejectModel(command, CheckCredentialsSQLCommand);

    const userAccount = await this.authRepo.findByLoginOrEmail({
      loginOrEmail: command.inputData.loginOrEmail,
    });
    
    if (!userAccount) return null;

    const validPassword = await this.bcryptAdapter.compareAsync(
      command.inputData.password,
      userAccount.password_hash,
    );

    if (!validPassword) return null;

    return {
      userId: userAccount.id,
    };
  }
}

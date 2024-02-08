import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BcryptAdapter } from '../../../../infra/adapters/bcrypt-adapter';
import { validateOrRejectModel } from '../../../../infra/validators/validate-or-reject.model';
import { UserIdType } from '../../../admin/api/models/outputSA.models.ts/user-models';
import { AuthUsersRepository } from '../../infrastructure/auth-users.repository';
import { CheckCredentialsCommand } from './commands/check-credentials.command';

@CommandHandler(CheckCredentialsCommand)
export class CheckCredentialsUseCase
  implements ICommandHandler<CheckCredentialsCommand>
{
  constructor(
    private authUsersRepository: AuthUsersRepository,
    private bcryptAdapter: BcryptAdapter,
  ) {}

  async execute(command: CheckCredentialsCommand): Promise<UserIdType | null> {
    await validateOrRejectModel(command, CheckCredentialsCommand);

    const user = await this.authUsersRepository.findByLoginOrEmail({
      loginOrEmail: command.inputData.loginOrEmail,
    });

    if (!user) return null;

    const validPassword = await this.bcryptAdapter.compareAsync(
      command.inputData.password,
      user.accountData.passwordHash,
    );

    if (!validPassword) return null;

    return {
      userId: user._id.toString(),
    };
  }
}

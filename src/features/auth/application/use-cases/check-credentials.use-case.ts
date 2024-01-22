import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BcryptAdapter } from '../../../../infra/adapters/bcrypt-adapter';
import { InputCredentialsModel } from '../../api/models/auth-input.models.ts/input-credentials.model';
import { AuthUsersRepository } from '../../infrastructure/authUsers-repository';
import { validateOrRejectModel } from '../../../../infra/validators/validate-model.helper';
import { UserIdType } from '../../../admin/api/models/outputSA.models.ts/user-models';

export class CheckCredentialsCommand {
  constructor(public inputData: InputCredentialsModel) {}
}

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

    const validPassword = this.bcryptAdapter.compareAsync(
      command.inputData.password,
      user.accountData.passwordHash,
    );

    if (!validPassword) return null;

    return {
      userId: user._id.toString(),
    };
  }
}

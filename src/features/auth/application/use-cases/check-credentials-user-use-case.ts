import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BcryptAdapter } from '../../../../infra/adapters/bcrypt-adapter';
import { InputCredentialsModel } from '../../api/models/auth-input.models.ts/input-credentials.model';
import { AuthRepository } from '../../infrastructure/authUsers-repository';
import { UserIdType } from '../auth-user.service';
import { validateOrRejectModel } from '../../../blogs/application/validate-model.helper';

export class CheckCredentialsCommand {
  constructor(public inputData: InputCredentialsModel) {}
}

@CommandHandler(CheckCredentialsCommand)
export class CheckCredentialsUseCase
  implements ICommandHandler<CheckCredentialsCommand>
{
  constructor(
    private authUsersRepository: AuthRepository,
    private bcryptAdapter: BcryptAdapter,
  ) {}

  async execute(command: CheckCredentialsCommand): Promise<UserIdType | null> {
    await validateOrRejectModel(command, CheckCredentialsCommand)
    
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

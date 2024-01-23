import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { BcryptAdapter } from '../../../../infra/adapters/bcrypt-adapter';
import { validateOrRejectModel } from '../../../../infra/validators/validate-model.helper';
import { InputRecoveryPassModel } from '../../api/models/auth-input.models.ts/input-recovery.model';
import { AuthUsersRepository } from '../../infrastructure/authUsers-repository';
import { UpdatePasswordCommand } from './commands/update-password.command';
import { CreateUserCommand } from './commands/create-user.command';

@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordUseCase
  implements ICommandHandler<UpdatePasswordCommand>
{
  constructor(
    private authUsersRepository: AuthUsersRepository,
    private bcryptAdapter: BcryptAdapter,
    private commandBus: CommandBus,
  ) {}

  async execute(command: UpdatePasswordCommand): Promise<boolean> {
    await validateOrRejectModel(command, UpdatePasswordCommand);

    const { recoveryCode, newPassword } = command.inputData;

    const foundExistingUserAccount =
      await this.authUsersRepository.findUserByRecoveryCode(recoveryCode);

    const foundTemporaryUserAccount =
      await this.authUsersRepository.findTemporaryUserAccountByCode(
        recoveryCode,
      );

    const { passwordHash, passwordSalt } =
      await this.bcryptAdapter.createHash(newPassword);

    if (foundExistingUserAccount) {
      const updatedUserPasswords =
        await this.authUsersRepository.updateUserPassword({
          passwordHash,
          passwordSalt,
          recoveryCode,
        });

      return updatedUserPasswords;
    }

    if (foundTemporaryUserAccount) {
      const uniqueLogin = uuidv4();

      const createUserCommand = new CreateUserCommand({
        login: uniqueLogin,
        email: foundTemporaryUserAccount.email,
        password: newPassword,
      });

      const createdUser = await this.commandBus.execute(createUserCommand);

      const deleteTempAccount =
        await this.authUsersRepository.deleteTemporaryUserAccount(recoveryCode);
      return !!createdUser;
    }

    return false;
  }
}

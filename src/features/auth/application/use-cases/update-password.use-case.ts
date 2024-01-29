import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { BcryptAdapter } from '../../../../infra/adapters/bcrypt-adapter';
import { validateOrRejectModel } from '../../../../infra/validators/validate-or-reject.model';
import { AuthUsersRepository } from '../../infrastructure/authUsers-repository';
import { CreateUserCommand } from './commands/create-user.command';
import { UpdatePasswordCommand } from './commands/update-password.command';
import { UserAccountDocument } from '../../../admin/domain/entities/userAccount.schema';

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
      const updatedUserPasswordFields = foundExistingUserAccount.updateHashAndSalt(passwordHash, passwordSalt)
      const updatedUserPasswords =
        await this.authUsersRepository.save(foundExistingUserAccount);

      return !!updatedUserPasswords;
    }

    if (foundTemporaryUserAccount) {
      const uniqueLogin = uuidv4();

      const createUserCommand = new CreateUserCommand({
        login: uniqueLogin,
        email: foundTemporaryUserAccount.email,
        password: newPassword,
      });

      const createdUser = await this.commandBus.execute<CreateUserCommand, UserAccountDocument | null>(createUserCommand);

      const deleteTempAccount =
        await this.authUsersRepository.deleteTemporaryUserAccount(recoveryCode);
      return !!createdUser;
    }

    return false;
  }
}

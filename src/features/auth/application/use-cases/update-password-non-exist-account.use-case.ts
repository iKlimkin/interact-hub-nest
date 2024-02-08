import { BadRequestException } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { validateOrRejectModel } from '../../../../infra/validators/validate-or-reject.model';
import { UserAccountDocument } from '../../../admin/domain/entities/userAccount.schema';
import { AuthUsersRepository } from '../../infrastructure/auth-users.repository';
import { CreateUserCommand } from './commands/create-user.command';
import { UpdatePasswordForNonExistAccountCommand } from './commands/update-password-for-non-existing-account.command';

@CommandHandler(UpdatePasswordForNonExistAccountCommand)
export class UpdatePasswordForNonExistAccountUseCase
  implements ICommandHandler<UpdatePasswordForNonExistAccountCommand>
{
  constructor(
    private authUsersRepository: AuthUsersRepository,
    private commandBus: CommandBus,
  ) {}

  async execute(
    command: UpdatePasswordForNonExistAccountCommand,
  ): Promise<boolean> {
    try {
      await validateOrRejectModel(
        command,
        UpdatePasswordForNonExistAccountCommand,
      );
    } catch (error) {
      throw new BadRequestException();
    }

    const { recoveryCode, newPassword } = command.inputDto;

    const temporaryUserAccount =
      await this.authUsersRepository.findTemporaryUserAccountByCode(
        recoveryCode,
      );

    if (!temporaryUserAccount) return false;
    const uniqueLogin = uuidv4();

    const createUserCommand = new CreateUserCommand({
      login: uniqueLogin,
      email: temporaryUserAccount.email,
      password: newPassword,
    });

    const createdUser = await this.commandBus.execute<
      CreateUserCommand,
      UserAccountDocument | null
    >(createUserCommand);

    return this.authUsersRepository.deleteTemporaryUserAccount(recoveryCode);
  }
}

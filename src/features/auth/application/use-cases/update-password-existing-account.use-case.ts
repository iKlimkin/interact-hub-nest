import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BcryptAdapter } from '../../../../infra/adapters/bcrypt-adapter';
import { validateOrRejectModel } from '../../../../infra/validators/validate-or-reject.model';
import { AuthUsersRepository } from '../../infrastructure/auth-users.repository';
import { UpdatePasswordForExistingAccountCommand } from './commands/update-password.command';

@CommandHandler(UpdatePasswordForExistingAccountCommand)
export class UpdatePasswordForExistingAccountUseCase
  implements ICommandHandler<UpdatePasswordForExistingAccountCommand>
{
  constructor(
    private authUsersRepository: AuthUsersRepository,
    private bcryptAdapter: BcryptAdapter,
  ) {}

  async execute(
    command: UpdatePasswordForExistingAccountCommand,
  ): Promise<boolean> {
    try {
      await validateOrRejectModel(
        command,
        UpdatePasswordForExistingAccountCommand,
      );
    } catch (error) {
      throw new BadRequestException();
    }

    const { recoveryCode, newPassword } = command.inputData;

    const userAccount = await this.authUsersRepository.findUserByRecoveryCode(
      recoveryCode,
    );

    const { passwordHash, passwordSalt } = await this.bcryptAdapter.createHash(
      newPassword,
    );

    userAccount!.updateHashAndSalt(passwordHash, passwordSalt);

    const updatedUserPasswords = await this.authUsersRepository.save(
      userAccount!,
    );

    return !!updatedUserPasswords;
  }
}

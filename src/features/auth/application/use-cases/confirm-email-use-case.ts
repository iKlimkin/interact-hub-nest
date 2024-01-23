import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserAccountDocument } from '../../../admin/domain/entities/userAccount.schema';
import { AuthUsersRepository } from '../../infrastructure/authUsers-repository';
import { ConfirmEmailCommand } from './commands/confirm-email.command';

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(private authUsersRepository: AuthUsersRepository) {}

  async execute(
    command: ConfirmEmailCommand,
  ): Promise<UserAccountDocument | null> {
    const { code } = command.inputModel;

    const user =
      await this.authUsersRepository.findUserByConfirmationCode(code);
    // throw new BadRequestException([{ message: 'confirmation code not found', field: 'code' }]);
    if (!user) return null;

    const { confirmationCode } = user.emailConfirmation;

    //  throw new BadRequestException([{ message: 'user is already confirmed', field: 'code' }]);
    if (user.canBeConfirmed(confirmationCode)) return null;

    user.confirm();

    return this.authUsersRepository.save(user);
  }
}
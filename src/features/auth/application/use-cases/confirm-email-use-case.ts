import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserAccountDocument } from '../../../admin/domain/entities/userAccount.schema';
import { InputRegistrationCodeModel } from '../../api/models/auth-input.models.ts/input-registration-code.model';
import { AuthUsersRepository } from '../../infrastructure/authUsers-repository';

export class ConfirmEmailCommand {
  constructor(public inputModel: InputRegistrationCodeModel) {}
}

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
    console.log({ user: user.emailConfirmation });

    user.confirm();

    return await this.authUsersRepository.save(user);
  }
}

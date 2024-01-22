import { InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { EmailManager } from '../../../../infra/application/managers/email-manager';
import { UserAccountViewModel } from '../../api/models/auth.output.models/auth.output.models';
import { AuthUsersRepository } from '../../infrastructure/authUsers-repository';

export class UpdateConfirmationCodeCommand {
  constructor(public inputModel: UserAccountViewModel) {}
}

@CommandHandler(UpdateConfirmationCodeCommand)
export class UpdateConfirmationCodeUseCase
  implements ICommandHandler<UpdateConfirmationCodeCommand>
{
  constructor(
    private authUsersRepository: AuthUsersRepository,
    private emailManager: EmailManager,
  ) {}

  async execute(command: UpdateConfirmationCodeCommand): Promise<boolean> {
    const newConfirmationCode = uuidv4();
    const { email } = command.inputModel.accountData;
    try {
      const updatedCode = await this.authUsersRepository.updateConfirmationCode(
        email,
        newConfirmationCode,
      );

      const confirmLetter =
        await this.emailManager.sendEmailConfirmationMessage(
          email,
          newConfirmationCode,
        );

      return updatedCode;
    } catch (error) {
      throw new InternalServerErrorException(
        'during update confirmation occured some problems',
        error,
      );
    }
  }
}

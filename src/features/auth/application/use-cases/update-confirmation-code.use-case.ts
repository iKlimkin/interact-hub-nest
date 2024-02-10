import { InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { AuthUsersRepository } from '../../infrastructure/auth-users.repository';
import { UpdateConfirmationCodeCommand } from './commands/update-confirmation-code.command';
import { EmailNotificationEvent } from './events/email-notification-event';

@CommandHandler(UpdateConfirmationCodeCommand)
export class UpdateConfirmationCodeUseCase
  implements ICommandHandler<UpdateConfirmationCodeCommand>
{
  constructor(
    private authUsersRepository: AuthUsersRepository,
    private eventBus: EventBus,
  ) {}

  async execute(command: UpdateConfirmationCodeCommand): Promise<boolean> {
    const newConfirmationCode = uuidv4();
    const { email } = command.inputModel.accountData;

    try {
      const updatedCode = await this.authUsersRepository.updateConfirmationCode(
        email,
        newConfirmationCode,
      );

      const event = new EmailNotificationEvent(email, newConfirmationCode);

      this.eventBus.publish(event);

      return updatedCode;
    } catch (error) {
      throw new InternalServerErrorException(
        'during update confirmation occurred some problems',
        error,
      );
    }
  }
}

import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { AuthUsersSqlRepository } from '../../infrastructure/auth-users.sql-repository';
import { UpdateConfirmationCodeSqlCommand } from './commands/update-confirmation-code-sql.command';
import { EmailNotificationEvent } from './events/email-notification-event';

@CommandHandler(UpdateConfirmationCodeSqlCommand)
export class UpdateConfirmationCodeSqlUseCase
  implements ICommandHandler<UpdateConfirmationCodeSqlCommand>
{
  constructor(
    private authUsersSqlRepository: AuthUsersSqlRepository,
    private eventBus: EventBus,
  ) {}

  async execute(command: UpdateConfirmationCodeSqlCommand): Promise<boolean> {
    const newConfirmationCode = uuidv4();
    const { email } = command.inputModel;

    const updatedCode =
      await this.authUsersSqlRepository.updateConfirmationCode(
        email,
        newConfirmationCode,
      );

    const event = new EmailNotificationEvent(email, newConfirmationCode);

    this.eventBus.publish(event);

    return updatedCode;
  }
}

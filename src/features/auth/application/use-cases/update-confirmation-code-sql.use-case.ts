import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AuthUsersSqlRepository } from '../../infrastructure/auth-users.sql-repository';
import { AuthUsersTORRepository } from '../../infrastructure/auth-users.tor-repository';
import { UpdateConfirmationCodeSqlCommand } from './commands/update-confirmation-code-sql.command';
import { EmailNotificationEvent } from './events/email-notification-event';
import { createRecoveryCode } from './helpers/create-recovery-message.helper';

@CommandHandler(UpdateConfirmationCodeSqlCommand)
export class UpdateConfirmationCodeSqlUseCase
  implements ICommandHandler<UpdateConfirmationCodeSqlCommand>
{
  constructor(
    private authUsersSqlRepository: AuthUsersSqlRepository,
    private authRepo: AuthUsersTORRepository,
    private eventBus: EventBus,
  ) {}

  async execute(command: UpdateConfirmationCodeSqlCommand): Promise<boolean> {
    const { expirationDate, recoveryCode } = createRecoveryCode();
    const { email } = command.inputModel.accountData;

    const updatedCode = await this.authRepo.updateConfirmationCode(
      email,
      recoveryCode,
      expirationDate,
    );

    const event = new EmailNotificationEvent(email, recoveryCode);

    this.eventBus.publish(event);

    return updatedCode;
  }
}

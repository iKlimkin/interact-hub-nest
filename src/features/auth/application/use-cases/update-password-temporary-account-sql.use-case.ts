import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { validateOrRejectModel } from '../../../../infra/validators/validate-or-reject.model';
import { AuthUsersSqlRepository } from '../../infrastructure/auth-users.sql-repository';
import { UpdatePasswordTemporaryAccountSqlCommand } from './commands/update-password-temporary-account-sql.command';
import { CreateUserAccountEvent } from './events/create-user-account-event';

@CommandHandler(UpdatePasswordTemporaryAccountSqlCommand)
export class UpdatePasswordTemporaryAccountSqlUseCase
  implements ICommandHandler<UpdatePasswordTemporaryAccountSqlCommand>
{
  constructor(
    private authUsersSqlRepository: AuthUsersSqlRepository,
    private eventBus: EventBus,
  ) {}

  async execute(
    command: UpdatePasswordTemporaryAccountSqlCommand,
  ): Promise<boolean> {
    await validateOrRejectModel(
      command,
      UpdatePasswordTemporaryAccountSqlCommand,
    );

    const { recoveryCode, newPassword } = command.inputDto;

    const temporaryUserAccount =
      await this.authUsersSqlRepository.findTemporaryAccountByRecoveryCode(
        recoveryCode,
      );

    if (!temporaryUserAccount) {
      throw new Error();
    }

    const uniqueLogin = uuidv4();

    const event = new CreateUserAccountEvent({
      email: temporaryUserAccount.email,
      login: uniqueLogin,
      password: newPassword,
    });

    await this.eventBus.publish(event);

    return this.authUsersSqlRepository.deleteTemporaryUserAccount(recoveryCode);
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthUsersSqlRepository } from '../../infrastructure/auth-users.sql-repository';
import { ConfirmEmailSqlCommand } from './commands/confirm-email-sql.command';

@CommandHandler(ConfirmEmailSqlCommand)
export class ConfirmEmailSqlUseCase
  implements ICommandHandler<ConfirmEmailSqlCommand>
{
  constructor(private authUsersSqlRepository: AuthUsersSqlRepository) {}

  async execute(command: ConfirmEmailSqlCommand): Promise<boolean> {
    const { code } = command.inputModel;

    const user =
      await this.authUsersSqlRepository.findUserAccountByConfirmationCode(code);

    if (!user || user.is_confirmed) return false;

    return this.authUsersSqlRepository.updateConfirmation(user.id);
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthUsersSqlRepository } from '../../infrastructure/auth-users.sql-repository';
import { ConfirmEmailSqlCommand } from './commands/confirm-email-sql.command';
import { AuthUsersTORRepository } from '../../infrastructure/auth-users.tor-repository';

@CommandHandler(ConfirmEmailSqlCommand)
export class ConfirmEmailSqlUseCase
  implements ICommandHandler<ConfirmEmailSqlCommand>
{
  constructor(
    private authUsersSqlRepository: AuthUsersSqlRepository,
    private authRepo: AuthUsersTORRepository,
  ) {}

  async execute(command: ConfirmEmailSqlCommand): Promise<boolean> {
    const { code } = command.inputModel;

    const user = await this.authRepo.findUserAccountByConfirmationCode(code);

    if (!user || user.is_confirmed) return false;

    return this.authRepo.updateConfirmation(user.id);
  }
}

import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OutputId } from '../../../../domain/likes.types';
import { UserRecoveryType } from '../../api/models/auth.output.models/auth.output.models';
import { AuthUsersRepository } from '../../infrastructure/auth-users.repository';
import { CreateTemporaryAccountSqlCommand } from './commands/create-temp-account-sql.command';
import {} from './commands/create-temp-account.command';
import { SendRecoveryMsgCommand } from './commands/send-recovery-msg.command';
import { createRecoveryCode } from './helpers/create-recovery-message.helper';
import { AuthUsersSqlRepository } from '../../infrastructure/auth-users.sql-repository';

@CommandHandler(CreateTemporaryAccountSqlCommand)
export class CreateTemporaryAccountSqlUseCase
  implements ICommandHandler<CreateTemporaryAccountSqlCommand>
{
  constructor(
    private authUsersSqlRepository: AuthUsersSqlRepository,
    private commandBus: CommandBus,
  ) {}

  async execute(command: CreateTemporaryAccountSqlCommand): Promise<OutputId> {
    const recoveryPassInfo: UserRecoveryType = createRecoveryCode();

    const { email } = command.inputData;
    console.log({email});

    const temporaryUserAccount =
      await this.authUsersSqlRepository.createTemporaryUserAccount(
        recoveryPassInfo,
        email,
      );

    const sendRecoveryMsgCommand = new SendRecoveryMsgCommand({
      email,
      recoveryCode: recoveryPassInfo.recoveryCode,
    });

    this.commandBus.execute(sendRecoveryMsgCommand);

    return temporaryUserAccount!;
  }
}

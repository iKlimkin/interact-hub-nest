import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRecoveryType } from '../../api/models/auth.output.models/auth.output.models';
import { AuthUsersRepository } from '../../infrastructure/auth-users.repository';
import { PasswordRecoverySqlCommand } from './commands/recovery-password-sql.command';
import { SendRecoveryMsgCommand } from './commands/send-recovery-msg.command';
import { createRecoveryCode } from './helpers/create-recovery-message.helper';
import { AuthUsersSqlRepository } from '../../infrastructure/auth-users.sql-repository';

@CommandHandler(PasswordRecoverySqlCommand)
export class PasswordRecoverySqlUseCase
  implements ICommandHandler<PasswordRecoverySqlCommand>
{
  constructor(
    private commandBus: CommandBus,
    private authUsersSqlRepository: AuthUsersSqlRepository,
  ) {}

  async execute(command: PasswordRecoverySqlCommand): Promise<boolean> {
    const recoveryPassInfo: UserRecoveryType = createRecoveryCode();
    const { email } = command.inputData;
    
    const updateRecoveryCode =
      await this.authUsersSqlRepository.updateRecoveryCode(
        email,
        recoveryPassInfo,
      );

    if (!updateRecoveryCode) return updateRecoveryCode;

    const sendRecoveryMsgCommand = new SendRecoveryMsgCommand({
      email,
      recoveryCode: recoveryPassInfo.recoveryCode,
    });

    this.commandBus.execute(sendRecoveryMsgCommand);

    return updateRecoveryCode;
  }
}

import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRecoveryType } from '../../api/models/auth.output.models/auth.output.models';
import { AuthUsersRepository } from '../../infrastructure/auth-users.repository';
import { PasswordRecoveryCommand } from './commands/recovery-password.command';
import { createRecoveryCode } from './helpers/create-recovery-message.helper';
import { SendRecoveryMsgCommand } from './commands/send-recovery-msg.command';

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private commandBus: CommandBus,
    private authUsersRepository: AuthUsersRepository,
  ) {}

  async execute(command: PasswordRecoveryCommand): Promise<boolean> {
    const recoveryPassInfo: UserRecoveryType = createRecoveryCode();
    const { email } = command.inputData;

    const updateRecoveryCode =
      await this.authUsersRepository.updateRecoveryCode(
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

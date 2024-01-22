import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { UserRecoveryType } from '../../api/models/auth.output.models/auth.output.models';
import { AuthUsersRepository } from '../../infrastructure/authUsers-repository';
import { SendRecoveryMsgCommand } from './send-recovery-msg.use-case';
import { InputRecoveryEmailModel } from '../../api/models/auth-input.models.ts/input-password-rec.type';
import { createRecoveryCode } from './helpers/create-recovery-message.helper';

export class PasswordRecoveryCommand {
  constructor(public inputData: InputRecoveryEmailModel) {}
}

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

    this.commandBus.execute(
      new SendRecoveryMsgCommand({
        email,
        recoveryCode: recoveryPassInfo.recoveryCode,
      }),
    );

    return updateRecoveryCode;
  }
}

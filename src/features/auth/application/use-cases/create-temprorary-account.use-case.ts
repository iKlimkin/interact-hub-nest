import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InputRecoveryEmailModel } from '../../api/models/auth-input.models.ts/input-password-rec.type';
import { OutputId } from '../../../../infra/likes.types';
import { UserRecoveryType } from '../../api/models/auth.output.models/auth.output.models';
import { AuthUsersRepository } from '../../infrastructure/authUsers-repository';
import { SendRecoveryMsgCommand } from './send-recovery-msg.use-case';
import { createRecoveryCode } from './helpers/create-recovery-message.helper';

export class CreateTempAccountCommand {
  constructor(public inputData: InputRecoveryEmailModel) {}
}

@CommandHandler(CreateTempAccountCommand)
export class CreateTempAccountUseCase
  implements ICommandHandler<CreateTempAccountCommand>
{
  constructor(
    private authUsersRepository: AuthUsersRepository,
    private commandBus: CommandBus,
  ) {}

  async execute(command: CreateTempAccountCommand): Promise<OutputId> {
    const recoveryPassInfo: UserRecoveryType = createRecoveryCode();
    const { email } = command.inputData;
    const temporaryUserAccount =
      await this.authUsersRepository.createTemporaryUserAccount(
        recoveryPassInfo,
        email,
      );

    this.commandBus.execute(
      new SendRecoveryMsgCommand({
        email,
        recoveryCode: recoveryPassInfo.recoveryCode,
      }),
    );

    return temporaryUserAccount;
  }
}

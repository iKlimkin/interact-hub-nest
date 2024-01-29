import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OutputId } from '../../../../domain/likes.types';
import { UserRecoveryType } from '../../api/models/auth.output.models/auth.output.models';
import { AuthUsersRepository } from '../../infrastructure/authUsers-repository';
import { CreateTempAccountCommand } from './commands/create-temp-account.command';
import { SendRecoveryMsgCommand } from './commands/send-recovery-msg.command';
import { createRecoveryCode } from './helpers/create-recovery-message.helper';

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

    const sendRecoveryMsgCommand = new SendRecoveryMsgCommand({
      email,
      recoveryCode: recoveryPassInfo.recoveryCode,
    });

    this.commandBus.execute(sendRecoveryMsgCommand);

    return temporaryUserAccount;
  }
}

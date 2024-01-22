import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailManager } from '../../../../infra/application/managers/email-manager';

export class SendRecoveryMsgCommand {
  constructor(public inputData: { email: string; recoveryCode: string }) {}
}

@CommandHandler(SendRecoveryMsgCommand)
export class SendRecoveryMsgUseCase
  implements ICommandHandler<SendRecoveryMsgCommand>
{
  constructor(private emailManager: EmailManager) {}

  async execute(command: SendRecoveryMsgCommand) {
    return this.emailManager.sendEmailRecoveryMessage(
      command.inputData.email,
      command.inputData.recoveryCode,
    );
  }
}

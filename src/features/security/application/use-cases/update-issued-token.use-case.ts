import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityRepository } from '../../infrastructure/security.repository';
import { UpdateIssuedTokenCommand } from './commands/update-Issued-token.command';


@CommandHandler(UpdateIssuedTokenCommand)
export class UpdateIssuedTokenUseCase
  implements ICommandHandler<UpdateIssuedTokenCommand>
{
  constructor(private securityRepository: SecurityRepository) {}

  async execute(command: UpdateIssuedTokenCommand): Promise<boolean> {
    const updatedSessionDate = await this.securityRepository.updateIssuedToken(
      command.deviceId,
      command.issuedAt,
    );
    return updatedSessionDate;
  }
}

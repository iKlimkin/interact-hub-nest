import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecuritySqlRepository } from '../../infrastructure/security.sql-repository';
import { UpdateIssuedTokenSqlCommand } from './commands/update-Issued-token-sql.command';
import { SecurityTORRepository } from '../../infrastructure/security.tor-repository';

@CommandHandler(UpdateIssuedTokenSqlCommand)
export class UpdateIssuedTokenSqlUseCase
  implements ICommandHandler<UpdateIssuedTokenSqlCommand>
{
  constructor(
    private securitySqlRepository: SecuritySqlRepository,
    private securityTORRepository: SecurityTORRepository
    ) {}

  async execute(command: UpdateIssuedTokenSqlCommand): Promise<boolean> {
    const updatedSessionDate =
      await this.securityTORRepository.updateIssuedToken(
        command.deviceId,
        command.issuedAt,
        command.expirationDate,
      );
    return updatedSessionDate;
  }
}

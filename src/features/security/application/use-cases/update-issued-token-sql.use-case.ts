import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecuritySqlRepository } from '../../infrastructure/security.sql-repository';
import { UpdateIssuedTokenSqlCommand } from './commands/update-Issued-token-sql.command';

@CommandHandler(UpdateIssuedTokenSqlCommand)
export class UpdateIssuedTokenSqlUseCase
  implements ICommandHandler<UpdateIssuedTokenSqlCommand>
{
  constructor(private securitySqlRepository: SecuritySqlRepository) {}

  async execute(command: UpdateIssuedTokenSqlCommand): Promise<boolean> {
    const updatedSessionDate =
      await this.securitySqlRepository.updateIssuedToken(
        command.deviceId,
        command.issuedAt,
        command.expirationDate,
      );
    return updatedSessionDate;
  }
}

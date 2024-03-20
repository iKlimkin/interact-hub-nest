import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecuritySqlRepository } from '../../infrastructure/security.sql-repository';
import { DeleteActiveSessionSqlCommand } from './commands/delete-active-session-sql.command';
import { SecurityTORRepository } from '../../infrastructure/security.tor-repository';

@CommandHandler(DeleteActiveSessionSqlCommand)
export class DeleteActiveSessionSqlUseCase
  implements ICommandHandler<DeleteActiveSessionSqlCommand>
{
  constructor(
    private securitySqlRepository: SecuritySqlRepository,
    private securityRepo: SecurityTORRepository
    ) {}

  async execute(command: DeleteActiveSessionSqlCommand): Promise<boolean> {
    return this.securityRepo.deleteSpecificSession(command.deviceId);
  }
}

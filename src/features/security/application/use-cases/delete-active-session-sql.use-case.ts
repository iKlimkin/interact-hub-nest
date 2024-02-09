import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecuritySqlRepository } from '../../infrastructure/security.sql-repository';
import { DeleteActiveSessionSqlCommand } from './commands/delete-active-session-sql.command';

@CommandHandler(DeleteActiveSessionSqlCommand)
export class DeleteActiveSessionSqlUseCase
  implements ICommandHandler<DeleteActiveSessionSqlCommand>
{
  constructor(private securitySqlRepository: SecuritySqlRepository) {}

  async execute(command: DeleteActiveSessionSqlCommand): Promise<boolean> {
    return this.securitySqlRepository.deleteSpecificSession(command.deviceId);
  }
}

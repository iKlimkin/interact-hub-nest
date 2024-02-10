import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecuritySqlRepository } from '../../infrastructure/security.sql-repository';
import { DeleteOtherUserSessionsSqlCommand } from './commands/delete-other-user-sessions-sql.command';

@CommandHandler(DeleteOtherUserSessionsSqlCommand)
export class DeleteOtherUserSessionsSqlUseCase
  implements ICommandHandler<DeleteOtherUserSessionsSqlCommand>
{
  constructor(private securitySqlRepository: SecuritySqlRepository) {}

  async execute(command: DeleteOtherUserSessionsSqlCommand): Promise<boolean> {
    return this.securitySqlRepository.deleteOtherUserSessions(command.deviceId);
  }
}

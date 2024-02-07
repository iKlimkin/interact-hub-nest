import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSQLRepository } from '../../infrastructure/users.sql-repository';
import { DeleteSACommand } from './commands/delete-sa.command';

@CommandHandler(DeleteSACommand)
export class DeleteSAUseCase implements ICommandHandler<DeleteSACommand> {
  constructor(private usersSQLRepository: UsersSQLRepository) {}
  async execute(command: DeleteSACommand): Promise<boolean> {
    return this.usersSQLRepository.deleteUser(command.userId);
  }
}

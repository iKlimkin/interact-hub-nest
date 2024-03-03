import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsSqlRepository } from '../../infrastructure/posts.sql-repository';
import { DeletePostSqlCommand } from './commands/delete-post-sql.command';

@CommandHandler(DeletePostSqlCommand)
export class DeletePostSqlUseCase
  implements ICommandHandler<DeletePostSqlCommand>
{
  constructor(private postsSqlRepository: PostsSqlRepository) {}

  async execute(command: DeletePostSqlCommand): Promise<void> {
    this.postsSqlRepository.deletePost(command.postId);
  }
}

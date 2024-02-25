import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { DeletePostSqlCommand } from './commands/delete-post-sql.command';
import { PostsSqlRepository } from '../../infrastructure/posts.sql-repository';

@CommandHandler(DeletePostSqlCommand)
export class DeletePostSqlUseCase
  implements ICommandHandler<DeletePostSqlCommand>
{
  constructor(private postsSqlRepository: PostsSqlRepository) {}

  async execute(command: DeletePostSqlCommand): Promise<boolean> {
    return this.postsSqlRepository.deletePost(command.postId);
  }
}

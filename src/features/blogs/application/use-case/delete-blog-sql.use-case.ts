import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../infrastructure/blogs.sql-repository';
import { DeleteBlogSqlCommand } from './commands/delete-blog-sql.command';

@CommandHandler(DeleteBlogSqlCommand)
export class DeleteBlogSqlUseCase
  implements ICommandHandler<DeleteBlogSqlCommand>
{
  constructor(private blogsSqlRepository: BlogsSqlRepository) {}

  async execute(command: DeleteBlogSqlCommand): Promise<boolean> {
    return this.blogsSqlRepository.deleteBlog(command.blogId);
  }
}

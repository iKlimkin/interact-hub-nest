import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../infrastructure/blogs.sql-repository';
import { UpdateBlogSqlCommand } from './commands/update-blog-sql.command';

@CommandHandler(UpdateBlogSqlCommand)
export class UpdateBlogSqlUseCase
  implements ICommandHandler<UpdateBlogSqlCommand>
{
  constructor(private blogsSqlRepository: BlogsSqlRepository) {}
  async execute(updateBlogDto: UpdateBlogSqlCommand): Promise<boolean> {
    return this.blogsSqlRepository.updateBlog(updateBlogDto.updateBlogDto);
  }
}

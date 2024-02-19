import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogModelType } from '../../domain/entities/blog.schema';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UpdateBlogSqlCommand } from './commands/update-blog-sql.command';
import { BlogsSqlRepository } from '../../infrastructure/blogs.sql-repository';

@CommandHandler(UpdateBlogSqlCommand)
export class UpdateBlogSqlUseCase
  implements ICommandHandler<UpdateBlogSqlCommand>
{
  constructor(private blogsSqlRepository: BlogsSqlRepository) {}
  async execute(updateBlogDto: UpdateBlogSqlCommand): Promise<boolean> {
    return this.blogsSqlRepository.updateBlog(updateBlogDto.updateBlogDto);
  }
}

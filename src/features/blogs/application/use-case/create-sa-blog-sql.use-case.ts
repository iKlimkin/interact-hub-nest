import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OutputId } from '../../../../domain/likes.types';
import { validateOrRejectModel } from '../../../../infra/validators/validate-or-reject.model';
import { BlogDtoSqlModel } from '../../api/models/blog-sql.model';
import { BlogsSqlRepository } from '../../infrastructure/blogs.sql-repository';
import { CreateSABlogSqlCommand } from './commands/create-sa-blog-sql.command';

@CommandHandler(CreateSABlogSqlCommand)
export class CreateBlogSASqlUseCase
  implements ICommandHandler<CreateSABlogSqlCommand>
{
  constructor(private blogsSqlRepository: BlogsSqlRepository) {}

  async execute(command: CreateSABlogSqlCommand): Promise<OutputId | null> {
    await validateOrRejectModel(command, CreateSABlogSqlCommand);

    const { description, name, websiteUrl, userId } = command.createBlogDto;

    const blogDto = new BlogDtoSqlModel(name, description, websiteUrl, userId);

    return this.blogsSqlRepository.save(blogDto);
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { OutputId } from '../../../../domain/likes.types';
import { InputBlogModel } from '../../api/models/input.blog.models/create.blog.model';
import { Blog, BlogModelType } from '../../domain/entities/blog.schema';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { validateOrRejectModel } from '../../../../infra/validators/validate-or-reject.model';
import { BadRequestException } from '@nestjs/common';
import { CreateBlogSqlCommand } from './commands/create-blog-sql.command';
import { BlogDBSqlType } from '../../api/models/blog-sql.model';
import { BlogsSqlRepository } from '../../infrastructure/blogs.sql-repository';

@CommandHandler(CreateBlogSqlCommand)
export class CreateBlogSqlUseCase
  implements ICommandHandler<CreateBlogSqlCommand>
{
  constructor(private blogsSqlRepository: BlogsSqlRepository) {}

  async execute(command: CreateBlogSqlCommand): Promise<OutputId | null> {
    await validateOrRejectModel(command, CreateBlogSqlCommand);
    const { description, name, websiteUrl } = command.createBlogDto;

    const blogDto = new BlogDBSqlType(name, description, websiteUrl);

    return this.blogsSqlRepository.save(blogDto);
  }
}

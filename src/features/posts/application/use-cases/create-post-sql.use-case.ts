import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OutputId } from '../../../../domain/likes.types';
import { validateOrRejectModel } from '../../../../infra/validators/validate-or-reject.model';
import { BlogsSqlRepository } from '../../../blogs/infrastructure/blogs.sql-repository';
import { PostDtoSqlType } from '../../api/models/post-sql.model';
import { PostsSqlRepository } from '../../infrastructure/posts.sql-repository';
import { CreatePostSqlCommand } from './commands/create-post-sql.command';

@CommandHandler(CreatePostSqlCommand)
export class CreatePostSqlUseCase
  implements ICommandHandler<CreatePostSqlCommand>
{
  constructor(
    private postsSqlRepository: PostsSqlRepository,
    private blogsSqlRepository: BlogsSqlRepository,
  ) {}

  async execute(command: CreatePostSqlCommand): Promise<OutputId | null> {
    await validateOrRejectModel(command, CreatePostSqlCommand);

    const { title, shortDescription, content, blogId } = command.createDataDto;

    const blog = await this.blogsSqlRepository.getBlogById(blogId);

    if (!blog) throw new NotFoundException('blog not found');

    const postDto = new PostDtoSqlType({
      title,
      short_description: shortDescription,
      content,
      blog_id: blog.id,
      blog_title: blog.title,
    });

    return this.postsSqlRepository.save(postDto);
  }
}

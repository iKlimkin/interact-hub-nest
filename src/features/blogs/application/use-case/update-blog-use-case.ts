import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogModelType } from '../../domain/entities/blog.schema';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class UpdateBlogCommand {
  constructor(public updateBlogDto: UpdateBlogCommandType) {}
}

type UpdateBlogCommandType = {
  name: string;
  description: string;
  websiteUrl: string;
  blogId: string;
};

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}
  async execute(updateBlogDto: UpdateBlogCommand): Promise<boolean> {
    const { name, description, websiteUrl, blogId } =
      updateBlogDto.updateBlogDto;

    return this.blogsRepository.updateBlog(blogId, {
      name,
      description,
      websiteUrl,
    });
  }
}

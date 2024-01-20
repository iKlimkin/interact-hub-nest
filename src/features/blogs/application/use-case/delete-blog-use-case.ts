import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class DeletBlogCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeletBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeletBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: DeletBlogCommand): Promise<boolean> {
    return await this.blogsRepository.deleteBlog(command.blogId);
  }
}

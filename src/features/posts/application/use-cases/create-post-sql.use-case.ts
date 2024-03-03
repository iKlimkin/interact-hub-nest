import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OutputId } from '../../../../domain/likes.types';
import { LayerNoticeInterceptor } from '../../../../infra/utils/interlayer-error-handler.ts/error-layer-interceptor';
import { GetErrors } from '../../../../infra/utils/interlayer-error-handler.ts/user-errors';
import { validateOrRejectModel } from '../../../../infra/validators/validate-or-reject.model';
import { BlogsSqlRepository } from '../../../blogs/infrastructure/blogs.sql-repository';
import { PostDtoSqlModel } from '../../api/models/post-sql.model';
import { PostsSqlRepository } from '../../infrastructure/posts.sql-repository';
import { CreatePostSqlCommand } from './commands/create-post-sql.command';

@CommandHandler(CreatePostSqlCommand)
export class CreatePostSqlUseCase
  implements ICommandHandler<CreatePostSqlCommand>
{
  constructor(
    private postsSqlRepository: PostsSqlRepository,
    private blogsSqlRepository: BlogsSqlRepository
  ) {}

  async execute(
    command: CreatePostSqlCommand,
  ): Promise<LayerNoticeInterceptor<OutputId | null>> {
    await validateOrRejectModel(command, CreatePostSqlCommand);
    const notice = new LayerNoticeInterceptor<OutputId>();

    const { title, shortDescription, content, blogId } = command.createDataDto;

    const blog = await this.blogsSqlRepository.getBlogById(blogId)

    if (!blog) {
      notice.addError('Blog not found', 'db', GetErrors.NotFound);
      return notice;
    }

    const postDto = new PostDtoSqlModel({
      title,
      short_description: shortDescription,
      content,
      blog_id: command.createDataDto.blogId,
      blog_title: blog.title,
    });

    const result = await this.postsSqlRepository.save(postDto);

    if (result) {
      notice.addData(result);
    } else {
      notice.addError('Post not created', 'db', GetErrors.DatabaseFail);
    }

    return notice;
  }
}

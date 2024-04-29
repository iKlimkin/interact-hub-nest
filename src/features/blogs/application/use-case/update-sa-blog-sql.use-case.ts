import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../infrastructure/blogs.sql-repository';
import { UpdateSABlogSqlCommand } from './commands/update-sa-blog-sql.command copy';
import { LayerNoticeInterceptor } from '../../../../infra/utils/interlayer-error-handler.ts/error-layer-interceptor';
import { GetErrors } from '../../../../infra/utils/interlayer-error-handler.ts/user-errors';
import { BlogsTORRepo } from '../../infrastructure/blogs.typeorm-repository';

@CommandHandler(UpdateSABlogSqlCommand)
export class UpdateSABlogSqlUseCase
  implements ICommandHandler<UpdateSABlogSqlCommand>
{
  constructor(
    private blogsSqlRepository: BlogsSqlRepository,
    private blogsRepo: BlogsTORRepo,
  ) {}
  async execute(
    updateBlogDto: UpdateSABlogSqlCommand,
  ): Promise<LayerNoticeInterceptor<boolean>> {
    const notice = new LayerNoticeInterceptor<boolean>();

    const result = await this.blogsRepo.updateBlog(updateBlogDto.updateBlogDto);

    if (!result) {
      notice.addError(
        `Couldn't update SA blog sa`,
        'UpdateSABlogSqlUseCase',
        GetErrors.DatabaseFail,
      );
    } else {
      notice.addData(result);
    }

    return notice;
  }
}

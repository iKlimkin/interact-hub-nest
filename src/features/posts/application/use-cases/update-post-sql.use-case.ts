import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { validateOrRejectModel } from '../../../../infra/validators/validate-or-reject.model';
import { PostsSqlRepository } from '../../infrastructure/posts.sql-repository';
import { UpdatePostSqlCommand } from './commands/update-post-sql.command';

@CommandHandler(UpdatePostSqlCommand)
export class UpdatePostSqlUseCase
  implements ICommandHandler<UpdatePostSqlCommand>
{
  constructor(private postsSqlRepository: PostsSqlRepository) {}

  async execute(command: UpdatePostSqlCommand): Promise<boolean> {
    await validateOrRejectModel(command, UpdatePostSqlCommand);

    return this.postsSqlRepository.updatePost(
      command.updatePostDto.postId,
      command.updatePostDto,
    );
  }
}

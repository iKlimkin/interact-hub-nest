import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCommentSqlCommand } from './commands/update-comment-sql.command';
import { FeedbacksSqlRepo } from '../../infrastructure/feedbacks.sql-repository';


@CommandHandler(UpdateCommentSqlCommand)
export class UpdateCommentSqlUseCase
  implements ICommandHandler<UpdateCommentSqlCommand>
{
  constructor(private feedbacksSqlRepository: FeedbacksSqlRepo) {}

  async execute(command: UpdateCommentSqlCommand): Promise<boolean> {
    return this.feedbacksSqlRepository.updateComment(
      command.commentId,
      command.content,
    );
  }
}

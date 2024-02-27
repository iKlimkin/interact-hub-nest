import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FeedbacksSqlRepo } from '../../infrastructure/feedbacks.sql-repository';
import { DeleteCommentSqlCommand } from './commands/delete-comment-sql.command';

@CommandHandler(DeleteCommentSqlCommand)
export class DeleteCommentSqlUseCase
  implements ICommandHandler<DeleteCommentSqlCommand>
{
  constructor(private feedbacksSqlRepository: FeedbacksSqlRepo) {}

  async execute(command: DeleteCommentSqlCommand): Promise<boolean> {
    return this.feedbacksSqlRepository.deleteComment(command.commentId);
  }
}

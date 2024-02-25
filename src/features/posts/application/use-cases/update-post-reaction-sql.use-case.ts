import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ReactionPostDtoType,
  ReactionPostType,
} from '../../../../domain/likes.types';
import { getStatusCounting } from '../../../../infra/utils/status-counter';
import { PostsSqlRepository } from '../../infrastructure/posts.sql-repository';
import { UpdatePostReactionSqlCommand } from './commands/update-post-reaction-sql.use-case';

@CommandHandler(UpdatePostReactionSqlCommand)
export class UpdatePostReactionSqlUseCase
  implements ICommandHandler<UpdatePostReactionSqlCommand>
{
  constructor(private postsSqlRepository: PostsSqlRepository) {}

  async execute(command: UpdatePostReactionSqlCommand) {
    const { postId, userId, inputStatus, login } =
      command.updatePostReactionDto;

    const currentStatus = await this.postsSqlRepository.getUserReaction(
      userId,
      postId,
    );

    await this.handleReaction({
      postId,
      userId,
      userLogin: login,
      inputStatus,
      currentStatus,
    });
  }

  private async handleReaction(reactionPostModel: ReactionPostType) {
    const { postId, currentStatus, inputStatus, userId, userLogin } =
      reactionPostModel;

    const { likesCount, dislikesCount } = getStatusCounting(
      inputStatus,
      currentStatus || 'None',
    );

    const reactionData: ReactionPostDtoType = {
      postId,
      userId,
      userLogin,
      inputStatus,
      dislikesCount,
      likesCount,
    };

    await this.postsSqlRepository.updateReactionType(reactionData);
  }
}

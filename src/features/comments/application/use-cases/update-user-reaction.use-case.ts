import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FeedbacksRepository } from '../../infrastructure/feedbacks.repository';
import { UpdateUserReactionCommand } from './commands/update-user-reaction.command';
import { getStatusCounting } from '../../../../infra/utils/status-counter';
import { LikeStatusType, ReactionType } from '../../../../domain/likes.types';

@CommandHandler(UpdateUserReactionCommand)
export class UpdateUserReactionUseCase
  implements ICommandHandler<UpdateUserReactionCommand>
{
  constructor(private feedbacksRepository: FeedbacksRepository) {}

  async execute(command: UpdateUserReactionCommand) {
    const { commentId, userId, inputStatus } = command.inputData;

    const existingReaction = await this.feedbacksRepository.getUserReaction(
      userId,
      commentId,
    );

    await this.handleReaction(commentId, userId, inputStatus, existingReaction);
  }

  private async handleReaction(
    commentId: string,
    userId: string,
    inputStatus: LikeStatusType,
    currentStatus: LikeStatusType | null,
  ) {
    const { likesCount, dislikesCount } = getStatusCounting(
      inputStatus,
      currentStatus || 'None',
    );

    const reactionData: ReactionType = {
      commentId,
      userId,
      inputStatus,
      dislikesCount,
      likesCount,
    };

    if (!currentStatus) {
      await this.feedbacksRepository.createLikeStatus(reactionData);
    } else {
      await this.feedbacksRepository.updateLikeStatus(reactionData);
    }
  }
}

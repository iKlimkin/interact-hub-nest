import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FeedbacksRepository } from '../../infrastructure/feedbacks.repository';
import { UpdateUserReactionCommand } from './commands/update-user-reaction.command';
import { getStatusCounting } from '../../../../infra/utils/status-counter';
import { LikeStatusType, ReactionType } from '../../../../domain/likes.types';

type ReactionDataType = {
  commentId: string;
  userId: string;
  inputStatus: LikeStatusType;
  currentStatus: LikeStatusType | null;
};

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
      
    await this.handleReaction({
      commentId,
      userId,
      inputStatus,
      currentStatus: existingReaction,
    });
  }

  private async handleReaction(reactionDto: ReactionDataType) {
    const { commentId, currentStatus, inputStatus, userId } = reactionDto;

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

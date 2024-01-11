import { Injectable, NotFoundException } from '@nestjs/common';
import { OutputId, likeUserInfo } from 'src/infra/likes.types';
import { InputCommentModel } from '../api/models/input.comment.models';
import {
  Comment,
  CommentModelType,
  CommentWholeModelTypes,
} from '../domain/entities/comment.schema';
import { FeedbacksRepository } from '../infrastructure/feedbacks.repository';
import { UsersRepository } from 'src/features/admin/infrastructure/users.repository';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private feedbacksRepository: FeedbacksRepository,
    private usersRepository: UsersRepository,
  ) {}

  async createComment(inputData: InputCommentModel): Promise<OutputId | null> {
    const user = await this.usersRepository.getUserById(inputData.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const commentSmartModel = this.CommentModel.makeInstance({
      commentatorInfo: {
        userId: inputData.userId,
        userLogin: user.accountData.login,
      },
      content: inputData.content,
      postId: inputData.postId,
    });

    return this.feedbacksRepository.save(commentSmartModel);
  }

  async createLike(inputData: likeUserInfo): Promise<boolean> {
    const createdLike =
      await this.feedbacksRepository.createLikeStatus(inputData);
    return createdLike;
  }

  async updateLike(inputData: likeUserInfo): Promise<boolean> {
    const updatedComment =
      await this.feedbacksRepository.updateLikeStatus(inputData);
    return updatedComment;
  }

  async updateComment(commentId: string, content: string): Promise<boolean> {
    return this.feedbacksRepository.updateComment(commentId, content);
  }

  async deleteComment(commentId: string): Promise<boolean> {
    return await this.feedbacksRepository.deleteComment(commentId);
  }
}

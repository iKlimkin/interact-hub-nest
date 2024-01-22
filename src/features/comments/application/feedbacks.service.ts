import { Injectable } from '@nestjs/common';
import { likeUserInfo } from '../../../infra/likes.types';
import { FeedbacksRepository } from '../infrastructure/feedbacks.repository';

@Injectable()
export class FeedbacksService {
  constructor(private feedbacksRepository: FeedbacksRepository) {}

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
}

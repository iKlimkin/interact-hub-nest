import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OutputId, likeUserInfo } from 'src/infra/likes.types';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/entities/comment.schema';

@Injectable()
export class FeedbacksRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async save(commentSmartModel: CommentDocument): Promise<OutputId> {
    try {
      const commentDB = await commentSmartModel.save();

      return {
        id: commentDB._id.toString(),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails during save comment operation',
        error,
      );
    }
  }

  async updateComment(commentId: string, content: string): Promise<boolean> {
    try {
      const comment = await this.CommentModel.findByIdAndUpdate(commentId, {
        $set: {
          content,
        },
      });

      return !!comment;
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails during update comment operation',
        error,
      );
    }
  }

  async deleteComment(commentId: string): Promise<boolean> {
    try {
      const result = await this.CommentModel.findByIdAndDelete(commentId);

      return !!result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails during delete comment operation', error
      );
    }
  }

  async createLikeStatus(likeInfo: likeUserInfo): Promise<boolean> {
    try {
      const createdLikeStatus = await this.CommentModel.findByIdAndUpdate(
        likeInfo.commentId,
        {
          $addToSet: {
            likesUserInfo: {
              userId: likeInfo.userId,
              status: likeInfo.status,
            },
          },
          $inc: {
            'likesCountInfo.likesCount': likeInfo.likesCount,
            'likesCountInfo.dislikesCount': likeInfo.dislikesCount,
          },
        },
        { new: true },
      );

      return createdLikeStatus !== null;
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails during make likeStatus in comment operation', error
      );
    }
  }

  async updateLikeStatus(likeInfo: likeUserInfo): Promise<boolean> {
    try {
      const updatedLike = await this.CommentModel.findOneAndUpdate(
        {
          _id: likeInfo.commentId,
          likesUserInfo: { $elemMatch: { userId: likeInfo.userId } },
        },
        {
          $set: {
            'likesUserInfo.$.status': likeInfo.status,
          },

          $inc: {
            'likesCountInfo.likesCount': likeInfo.likesCount,
            'likesCountInfo.dislikesCount': likeInfo.dislikesCount,
          },
        },

        { new: true },
      );

      return updatedLike !== null;
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails during update likeStatus in comment operation', error
      );
    }
  }
}

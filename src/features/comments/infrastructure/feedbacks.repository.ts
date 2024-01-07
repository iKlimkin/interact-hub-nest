import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  OutputId,
  likeUserInfo,
} from 'src/features/general-models/likes.types';
import { CommentType } from '../api/models/output.comment.models';
import { CommentModelType, CommentDocument, Comment } from '../comment.schema';

@Injectable()
export class FeedbacksRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async create(newComment: Readonly<CommentType>): Promise<OutputId> {
    try {
      const createdComment = await this.CommentModel.create(newComment);

      return {
        id: createdComment._id.toString(),
      };
    } catch (error) {
      throw new Error(
        `While creating the comment occured some errors: ${error}`,
      );
    }
  }

  async save(comment: CommentDocument): Promise<OutputId | null> {
    try {
      const commentDB = await comment.save();
      return {
        id: commentDB._id.toString(),
      };
    } catch (error) {
      console.error(`there were some problems during save user, ${error}`);
      return null;
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
      throw new Error(
        `While updating the comment occured some errors: ${error}`,
      );
    }
  }

  async deleteComment(commentId: string): Promise<boolean> {
    try {
      const result = await this.CommentModel.findByIdAndDelete(commentId);

      return !!result;
    } catch (error) {
      throw new Error(
        `there were some problems during removal comment, ${error}`,
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
      throw new Error(
        `there were some problems during create like status, ${error}`,
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
      throw new Error(
        `there were some problems during update like status, ${error}`,
      );
    }
  }
}

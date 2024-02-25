import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OutputId } from '../../../domain/likes.types';
import { CommentDtoSqlModel } from '../api/models/comment-dto-sql.model';

@Injectable()
export class FeedbacksSqlRepo {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async save(commentDto: CommentDtoSqlModel): Promise<OutputId | null> {
    try {
      const createQuery = `
        INSERT INTO comments (post_id, user_id, user_login, content)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `;

      const result = await this.dataSource.query(
        createQuery,
        Object.values(commentDto.createCommentDto),
      );

      return {
        id: result[0].id,
      };
    } catch (error) {
      console.error(`Database fails during save comment sql operate ${error}`);
      return null;
    }
  }

  // async updateComment(commentId: string, content: string): Promise<boolean> {
  //   try {
  //     const comment = await this.CommentModel.findByIdAndUpdate(commentId, {
  //       $set: {
  //         content,
  //       },
  //     });

  //     return !!comment;
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Database fails during update comment operation',
  //       error,
  //     );
  //   }
  // }

  // async deleteComment(commentId: string): Promise<boolean> {
  //   try {
  //     return this.CommentModel.findByIdAndDelete(commentId).lean();
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Database fails during delete comment operation',
  //       error,
  //     );
  //   }
  // }

  // async createLikeStatus(
  //   inputReactionData: ReactionCommentDto,
  // ): Promise<boolean> {
  //   try {
  //     const createdLikeStatus = await this.CommentModel.findByIdAndUpdate(
  //       new ObjectId(inputReactionData.commentId),
  //       {
  //         $addToSet: {
  //           likesUserInfo: {
  //             userId: inputReactionData.userId,
  //             status: inputReactionData.inputStatus,
  //           },
  //         },
  //         $inc: {
  //           'likesCountInfo.likesCount': inputReactionData.likesCount,
  //           'likesCountInfo.dislikesCount': inputReactionData.dislikesCount,
  //         },
  //       },
  //       { new: true },
  //     );

  //     return !!createdLikeStatus;
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Database fails during make likeStatus in comment operation',
  //       error,
  //     );
  //   }
  // }

  // async updateLikeStatus(
  //   inputReactionData: ReactionCommentDto,
  // ): Promise<boolean> {
  //   try {
  //     const updatedLike = await this.CommentModel.findOneAndUpdate(
  //       {
  //         _id: new ObjectId(inputReactionData.commentId),
  //         likesUserInfo: { $elemMatch: { userId: inputReactionData.userId } },
  //       },
  //       {
  //         $set: {
  //           'likesUserInfo.$.status': inputReactionData.inputStatus,
  //         },

  //         $inc: {
  //           'likesCountInfo.likesCount': inputReactionData.likesCount,
  //           'likesCountInfo.dislikesCount': inputReactionData.dislikesCount,
  //         },
  //       },
  //       { new: true },
  //     );

  //     return !!updatedLike;
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Database fails during update likeStatus in comment operation',
  //       error,
  //     );
  //   }
  // }

  // async getUserReaction(
  //   userId: string,
  //   commentId: string,
  // ): Promise<likesStatus | null> {
  //   try {
  //     const foundedUserReaction = await this.CommentModel.findById(
  //       new ObjectId(commentId),
  //       {
  //         likesUserInfo: {
  //           $elemMatch: {
  //             userId,
  //             status: { $exists: true },
  //           },
  //         },
  //       },
  //     );

  //     if (!foundedUserReaction) return null;

  //     const [status] = getLikeStatus(foundedUserReaction.likesUserInfo, userId);

  //     return status;
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       "Database fails during get user's likes operation in feedback",
  //       error,
  //     );
  //   }
  // }
}

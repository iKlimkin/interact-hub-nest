import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { likesStatus } from '../../../../domain/likes.types';
import { CommentsViewModel } from '../models/comments.view.models/comments.view.model';
import { getCommentsSqlViewModel } from '../models/comments.view.models/get.comments.sql-view.model';

@Injectable()
export class FeedbacksQuerySqlRepo {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  // async getCommentsByPostId(
  //   postId: string,
  //   inputData: CommentsQueryFilter,
  //   userId?: string,
  // ): Promise<PaginationViewModel<CommentsViewModel> | null> {
  //   try {
  //     const { searchContentTerm } = inputData;

  //     const { pageNumber, pageSize, sort, skip } = getPagination(inputData);

  //     const filter = getSearchTerm({ searchContentTerm });

  //     const comments = await this.CommentModel.find({
  //       postId,
  //       ...filter,
  //     })
  //       .sort(sort)
  //       .skip(skip)
  //       .limit(pageSize);

  //     const totalCount = await this.CommentModel.countDocuments({
  //       postId,
  //       ...filter,
  //     });
  //     const pagesCount = Math.ceil(totalCount / pageSize);

  //     return {
  //       pagesCount: pagesCount,
  //       page: pageNumber,
  //       pageSize: pageSize,
  //       totalCount: totalCount,
  //       items: comments.map((comment) => getCommentsViewModel(comment, userId)),
  //     };
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Database fails during find comments by postId operation',
  //       error,
  //     );
  //   }
  // }

  async getCommentById(
    commentId: string,
    userId?: string,
  ): Promise<CommentsViewModel | null> {
    try {
      let myReaction: likesStatus = likesStatus.None;

      if (userId) {
        const [reactionResult] = await this.dataSource.query<
          { reaction_type: likesStatus }[]
        >(
          `
            SELECT reaction_type
            FROM comment_reactions
            WHERE comment_id = $1 AND user_id = $2
          `,
          [commentId, userId],
        );

        myReaction = reactionResult
          ? reactionResult.reaction_type
          : likesStatus.None;
      }

      const reactionCounter = await this.dataSource.query(
        `
        SELECT *
          FROM comment_reaction_counts
          WHERE comment_id = $1
        `,
        [commentId],
      );

      const findQuery = `
        SELECT *
        FROM comments
        WHERE id = $1
      `;

      const result = await this.dataSource.query(findQuery, [commentId]);

      if (!result) return null;

      return getCommentsSqlViewModel(result[0], reactionCounter, myReaction);
    } catch (error) {
      console.error(
        'Database fails during find comment by id operation',
        error,
      );
      return null;
    }
  }

  // async getUserLikes(
  //   userId: string,
  //   commentId: string,
  // ): Promise<likesStatus | null> {
  //   try {
  //     const foundedUserReaction = await this.CommentModel.findOne({
  //       _id: commentId,
  //       likesUserInfo: {
  //         $elemMatch: {
  //           userId,
  //           status: { $exists: true },
  //         },
  //       },
  //     });

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

  // async getCommentsByUserId(
  //   userId: string,
  //   inputData: CommentsQueryFilter,
  // ): Promise<PaginationViewModel<CommentsViewModel>> {
  //   try {
  //     const { pageNumber, pageSize, sort, skip } = getPagination(inputData);

  //     const searchBy = { 'commentatorInfo.userId': userId };

  //     const userComments = await this.CommentModel.find(searchBy)
  //       .sort(sort)
  //       .skip(skip)
  //       .limit(pageSize);

  //     const totalCount = await this.CommentModel.countDocuments(searchBy);
  //     const pagesCount = Math.ceil(totalCount / pageSize);

  //     return {
  //       pagesCount: pagesCount,
  //       page: pageNumber,
  //       pageSize: pageSize,
  //       totalCount: totalCount,
  //       items: userComments.map((comment) =>
  //         getCommentsViewModel(comment, userId),
  //       ),
  //     };
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Database fails during find comment by userId operation',
  //       error,
  //     );
  //   }
  // }
}

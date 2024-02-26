import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { likesStatus } from '../../../../domain/likes.types';
import { CommentsViewModel } from '../models/comments.view.models/comments.view.model';
import { getCommentsSqlViewModel } from '../models/comments.view.models/get.comments.sql-view.model';
import { getCommentSqlViewModel } from '../models/comments.view.models/get-comment.sql-view.model';
import {
  CommentReactionsType,
  CommentSqlDbType,
} from '../models/output.comment.models/output.comment.models';
import { PaginationViewModel } from '../../../../domain/sorting-base-filter';
import { CommentsQueryFilter } from '../models/output.comment.models/comment-query.filter';
import { getPagination } from '../../../../infra/utils/pagination';

@Injectable()
export class FeedbacksQuerySqlRepo {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getCommentsByPostId(
    postId: string,
    queryOptions: CommentsQueryFilter,
    userId?: string,
  ): Promise<PaginationViewModel<CommentsViewModel> | null> {
    try {
      const { searchContentTerm } = queryOptions;

      const { pageNumber, pageSize, sortBy, skip, sortDirection } =
        getPagination(queryOptions, !!0, !0);

      const filter = `%${searchContentTerm ? searchContentTerm : ''}%`;

      const sortQuery = `
      SELECT *
        FROM comments
        WHERE content ILIKE $1 AND post_id = $2
        ORDER BY ${sortBy} ${sortDirection}
        LIMIT $3 OFFSET $4
      `;

      const result = await this.dataSource.query(sortQuery, [
        filter,
        postId,
        pageSize,
        skip,
      ]);
      
      let myReactions: CommentReactionsType[];

      if (userId) {
        const reactionsResult = await this.dataSource.query(
          `
          SELECT reaction_type, comment_id
          FROM posts p
          INNER JOIN comments c ON p.id = c.post_id
          INNER JOIN comment_reactions cr ON c.id = cr.comment_id
          WHERE user_id = $1
        `,
          [userId],
        );

        myReactions = reactionsResult;
      }

      const reactionCounter = await this.dataSource.query(
        `
        SELECT likes_count, dislikes_count, comment_id
        FROM comment_reaction_counts crc
        INNER JOIN comments ON crc.comment_id = comments.id
        WHERE post_id = $1
        `,
        [postId],
      );

      const [commentsCounter] = await this.dataSource.query(
        `
          SELECT COUNT(*)
          FROM comments
          WHERE content ILIKE $1 and post_id = $2
        `,
        [filter, postId],
      );

      const commentsViewModel = new PaginationViewModel<CommentsViewModel>(
        result.map((comment: CommentSqlDbType) =>
          getCommentsSqlViewModel(comment, reactionCounter, myReactions),
        ),
        pageNumber,
        pageSize,
        commentsCounter.count,
      );

      return commentsViewModel;
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails during find comments by postId operation',
        error,
      );
    }
  }

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

      const query = `
        SELECT content, c.user_id, c.user_login, created_at, likes_count, dislikes_count, cr.reaction_type, c.id
        FROM comments c
        LEFT JOIN comment_reaction_counts crc ON c.id = crc.comment_id
        LEFT JOIN comment_reactions cr USING(comment_id)
        WHERE c.id = $1
      `;

      const result = await this.dataSource.query<CommentSqlDbType>(query, [
        commentId,
      ]);

      if (!result) return null;

      return getCommentSqlViewModel(result[0], myReaction);
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

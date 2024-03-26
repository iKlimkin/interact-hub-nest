import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { likesStatus } from '../../../../domain/likes.types';
import { CommentsViewModel } from '../models/comments.view.models/comments.view.model';
import { getCommentsSqlViewModel } from '../models/comments.view.models/get.comments.sql-view.model';
import {
  getCommentSqlViewModel,
  getCommentTORViewModel,
} from '../models/comments.view.models/get-comment.sql-view.model';
import {
  CommentReactionsType,
  CommentSqlDbType,
} from '../models/output.comment.models/output.comment.models';
import { PaginationViewModel } from '../../../../domain/sorting-base-filter';
import { CommentsQueryFilter } from '../models/output.comment.models/comment-query.filter';
import { getPagination } from '../../../../infra/utils/pagination';
import { Comment } from '../../domain/entities/comment.entity';

@Injectable()
export class FeedbacksQueryTORRepo {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Comment) private readonly comments: Repository<Comment>,
  ) {}

  async getComments(
    queryOptions: CommentsQueryFilter,
    userId?: string,
  ): Promise<PaginationViewModel<CommentsViewModel>> {
    try {
      const { searchContentTerm } = queryOptions;

      const { pageNumber, pageSize, sortBy, skip, sortDirection } =
        getPagination(queryOptions, !!0, !0);

      const filter = `%${searchContentTerm ? searchContentTerm : ''}%`;

      const sortQuery = `
      SELECT *
        FROM comments
        WHERE content ILIKE $1
        ORDER BY ${sortBy} ${sortDirection}
        LIMIT $2 OFFSET $3
      `;

      const result = await this.dataSource.query(sortQuery, [
        filter,
        pageSize,
        skip,
      ]);

      let myReactions: CommentReactionsType[];

      if (userId) {
        const reactionsResult = await this.dataSource.query(
          `
          SELECT reaction_type, comment_id
          FROM comment_reactions
          WHERE user_id = $1
        `,
          [userId],
        );

        myReactions = reactionsResult;
      }

      const reactionCounter = await this.dataSource.query(
        `
        SELECT likes_count, dislikes_count, comment_id
        FROM comment_reaction_counts
        `,
      );

      const [commentsCounter] = await this.dataSource.query(
        `
          SELECT COUNT(*)
          FROM comments
          WHERE content ILIKE $1
        `,
        [filter],
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
      throw new Error(
        `Database fails during find comments by postId operation ${error}`,
      );
    }
  }
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
          SELECT cr.reaction_type, cr.comment_id
          FROM posts p
          INNER JOIN comments c ON p.id = c.post_id
          INNER JOIN comment_reactions cr ON c.id = cr.comment_id
          WHERE cr.user_id = $1 AND c.post_id = $2
        `,
          [userId, postId],
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
      console.error(
        `Database fails during find comments by postId operation ${error}`,
      );
      return null;
    }
  }

  async getCommentById(
    commentId: string,
    userId?: string,
  ): Promise<CommentsViewModel | null> {
    try {
      let myReaction: likesStatus = likesStatus.None;

      userId = '031b96ce-ba2c-4bfb-abeb-a0f6c8a6f570';

      if (userId) {
        const comment = await this.comments.findOne({
          where: { id: commentId },
          relations: ['commentReactions', 'commentReactions.userAccount'],
        });

        if (comment) {
          const userReaction = comment.commentReactions.find(
            (reaction) => reaction.userAccount.id === userId,
          );

          myReaction = userReaction
            ? userReaction.reaction_type
            : likesStatus.None;
        }
      }

      const comment = await this.comments.findOne({
        where: {
          id: commentId,
        },
        relations: ['commentReactionCounts', 'userAccount'],
      });

      if (!comment) return null;

      return getCommentTORViewModel(comment, myReaction);
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

  async getCommentsByUserId(
    userId: string,
    queryOptions: CommentsQueryFilter,
  ): Promise<PaginationViewModel<CommentsViewModel>> {
    try {
      const { pageNumber, pageSize, sortBy, skip, sortDirection } =
        getPagination(queryOptions, !!0, !0);

      const reactionsResult = await this.dataSource.query(
        `
          SELECT reaction_type, comment_id
            FROM comment_reactions cr
            WHERE user_id = $1
        `,
        [userId],
      );

      const userReactions: CommentReactionsType[] = reactionsResult;

      const reactionCounter = await this.dataSource.query(
        `
        SELECT likes_count, dislikes_count, comment_id
        FROM comment_reactions cr
        INNER JOIN comment_reaction_counts USING(comment_id)
        WHERE user_id = $1
        `,
        [userId],
      );

      const [commentsCounter] = await this.dataSource.query(
        `
          SELECT COUNT(id)
          FROM comments
          WHERE user_id = $1
        `,
        [userId],
      );

      const sortQuery = `
          SELECT *
            FROM comments
            WHERE user_id = $1
            ORDER BY ${sortBy} ${sortDirection}
            LIMIT $2 OFFSET $3
        `;

      const result = await this.dataSource.query(sortQuery, [
        userId,
        pageSize,
        skip,
      ]);

      const commentsViewModel = new PaginationViewModel<CommentsViewModel>(
        result.map((comment: CommentSqlDbType) =>
          getCommentsSqlViewModel(comment, reactionCounter, userReactions),
        ),
        pageNumber,
        pageSize,
        commentsCounter.count,
      );

      return commentsViewModel;
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails during find comment by userId operation',
        error,
      );
    }
  }
}

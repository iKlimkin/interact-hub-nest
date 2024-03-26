import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  OutputId,
  ReactionCommentDto,
  likesStatus,
} from '../../../domain/likes.types';
import { CommentDtoSqlModel } from '../api/models/comment-dto-sql.model';
import {
  CommentReactionsType,
  ReactionType,
} from '../api/models/output.comment.models/output.comment.models';
import { Comment } from '../domain/entities/comment.entity';

@Injectable()
export class FeedbacksTORRepo {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Comment) private readonly comments: Repository<Comment>,
  ) {}

  async createComment(
    commentDto: CommentDtoSqlModel,
  ): Promise<OutputId | null> {
    try {
      const { content, postId, userId, userlogin } =
        commentDto.createCommentDto;

      const comment = this.comments.create({
        post: {
          id: postId,
        },
        user_login: userlogin,
        userAccount: {
          id: userId,
        },
        content,
      });

      const result = await this.comments.save(comment);

      return {
        id: result.id,
      };
    } catch (error) {
      console.error(`Database fails during save comment sql operate ${error}`);
      return null;
    }
  }

  async updateComment(commentId: string, content: string): Promise<boolean> {
    try {
      const updateQuery = `
        UPDATE comments
        SET content = $1
        WHERE id = $2
      `;

      const result = await this.dataSource.query(updateQuery, [
        content,
        commentId,
      ]);

      return result[1] > 0;
    } catch (error) {
      console.error(`Database fails during update comment operation ${error}`);
      return false;
    }
  }

  async deleteComment(commentId: string): Promise<boolean> {
    try {
      const deleteQuery = `
        DELETE FROM comments
        WHERE id = $1
      `;

      const result = await this.dataSource.query(deleteQuery, [commentId]);

      return result[1] > 0;
    } catch (error) {
      console.error(`Database fails during delete comment operation ${error}`);
      return false;
    }
  }

  async updateReactionType(reactionDto: ReactionCommentDto): Promise<void> {
    try {
      const updateReactionQuery = `
      INSERT INTO comment_reactions (user_id, comment_id, reaction_type)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, comment_id) DO UPDATE SET reaction_type = EXCLUDED.reaction_type
    `;

      const updatedReaction = await this.dataSource.query(updateReactionQuery, [
        reactionDto.userId,
        reactionDto.commentId,
        reactionDto.inputStatus,
      ]);

      const updateCounterQuery = `
      INSERT INTO comment_reaction_counts (comment_id, likes_count, dislikes_count)
      VALUES ($1, $2, $3)
      ON CONFLICT (comment_id) DO UPDATE SET
        likes_count = comment_reaction_counts.likes_count + EXCLUDED.likes_count,
        dislikes_count = comment_reaction_counts.dislikes_count + EXCLUDED.dislikes_count
    `;

      const updatedReactionCounter = await this.dataSource.query(
        updateCounterQuery,
        [
          reactionDto.commentId,
          reactionDto.likesCount,
          reactionDto.dislikesCount,
        ],
      );
    } catch (error) {
      console.error(
        `Database fails during update likeStatus in comment operation ${error}`,
      );
    }
  }

  async getUserReaction(
    userId: string,
    commentId: string,
  ): Promise<likesStatus | null> {
    try {
      const findQuery = `
      SELECT *
        FROM comment_reactions
        WHERE user_id = $1 AND comment_id = $2
      `;

      const result = (
        await this.dataSource.query<ReactionType>(findQuery, [
          userId,
          commentId,
        ])
      )[0];

      if (!result) return null;

      return result.reaction_type;
    } catch (error) {
      console.error(`Database fails during get user's reaction in feedback",
      ${error}`);
      return null;
    }
  }
}

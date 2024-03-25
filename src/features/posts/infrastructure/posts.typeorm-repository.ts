import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  OutputId,
  ReactionPostDtoType,
  likesStatus,
} from '../../../domain/likes.types';
import { ReactionType } from '../../comments/api/models/output.comment.models/output.comment.models';
import { UpdatePostModel } from '../api/models/input.posts.models/create.post.model';
import { PostDtoSqlModel } from '../api/models/post-sql.model';
import { Post } from '../domain/entities/post.entity';

@Injectable()
export class PostsTorRepo {
  constructor(
    @InjectRepository(Post) private readonly posts: Repository<Post>,
  ) {}

  async createPost(
    postDto: Readonly<PostDtoSqlModel>,
  ): Promise<OutputId | null> {
    try {
      const post = this.posts.create({
        title: postDto.createPostDto.title,
        short_description: postDto.createPostDto.short_description,
        content: postDto.createPostDto.content,
        blog_title: postDto.createPostDto.blog_title,
        blog: {
          id: postDto.createPostDto.blog_id,
        },
      });

      const result = await this.posts.save(post);

      return {
        id: result.id,
      };
    } catch (error) {
      console.error(`Database fails during save post sql operate ${error}`);
      return null;
    }
  }

  // async getUserReaction(
  //   userId: string,
  //   postId: string,
  // ): Promise<likesStatus | null> {
  //   try {
  //     const findQuery = `
  //     SELECT *
  //       FROM post_reactions
  //       WHERE user_id = $1 AND post_id = $2
  //     `;

  //     const result = await this.dataSource.query<ReactionType>(findQuery, [
  //       userId,
  //       postId,
  //     ]);

  //     if (!result) return null;

  //     return result[0].reaction_type;
  //   } catch (error) {
  //     console.error(
  //       `Database fails operate with find user's reactions on post`,
  //     );
  //     return null;
  //   }
  // }

  async updatePost(updateData: UpdatePostModel): Promise<boolean> {
    try {
      const { content, shortDescription, title, postId } = updateData;

      const result = await this.posts.update(
        {
          id: postId,
        },
        { title, content, short_description: shortDescription },
      );

      return result.affected !== 0;
    } catch (error) {
      console.error(`Database fails during update post sql operate ${error}`);
      return false;
    }
  }

  // async updateReactionType(reactionDto: ReactionPostDtoType) {
  //   try {
  //     const updateReactionQuery = `
  //     INSERT INTO post_reactions (user_id, user_login, post_id, reaction_type)
  //     VALUES ($1, $2, $3, $4)
  //     ON CONFLICT (user_id, post_id) DO UPDATE SET reaction_type = EXCLUDED.reaction_type
  //   `;

  //     const updatedReaction = await this.dataSource.query(updateReactionQuery, [
  //       reactionDto.userId,
  //       reactionDto.userLogin,
  //       reactionDto.postId,
  //       reactionDto.inputStatus,
  //     ]);

  //     const updateCounterQuery = `
  //     INSERT INTO post_reaction_counts (post_id, likes_count, dislikes_count)
  //     VALUES ($1, $2, $3)
  //     ON CONFLICT (post_id) DO UPDATE SET
  //       likes_count = post_reaction_counts.likes_count + EXCLUDED.likes_count,
  //       dislikes_count = post_reaction_counts.dislikes_count + EXCLUDED.dislikes_count
  //   `;

  //     const updatedReactionCounter = await this.dataSource.query(
  //       updateCounterQuery,
  //       [reactionDto.postId, reactionDto.likesCount, reactionDto.dislikesCount],
  //     );
  //   } catch (error) {
  //     console.error(
  //       `Database fails during create post reaction operate ${error}`,
  //     );
  //   }
  // }

  async deletePost(postId: string): Promise<boolean> {
    try {
      const result = await this.posts.delete({ id: postId });

      return result.affected !== 0;
    } catch (error) {
      console.error(`Database fails during delete post sql operate ${error}`);
      return false;
    }
  }
}

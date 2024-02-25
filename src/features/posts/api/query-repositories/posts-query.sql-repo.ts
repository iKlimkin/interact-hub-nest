import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  PostsSqlDbType,
  UserReactionsOutType,
  UserReactionsType,
} from '../models/output.post.models/output.post.models';
import { PostViewModelType } from '../models/post.view.models/post-view-model.type';
import { getPostSqlViewModel } from '../models/post.view.models/post-view-sql.model';
import { PaginationViewModel } from '../../../../domain/sorting-base-filter';
import { PostsQueryFilter } from '../models/output.post.models/posts-query.filter';
import { getPagination } from '../../../../infra/utils/pagination';
import { likesStatus } from '../../../../domain/likes.types';

@Injectable()
export class PostsSqlQueryRepo {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getAllPosts(
    queryOptions: PostsQueryFilter,
    userId?: string,
  ): Promise<PaginationViewModel<PostViewModelType>> {
    try {
      const { searchContentTerm } = queryOptions;

      const { pageNumber, pageSize, skip, sortBy, sortDirection } =
        getPagination(queryOptions, !!0, !0);

      const searchTerm = `%${searchContentTerm ? searchContentTerm : ''}%`;

      const sortQuery = `
      SELECT *
        FROM posts
        WHERE content ILIKE $1
        ORDER BY ${sortBy} ${sortDirection}
        LIMIT $2 OFFSET $3
      `;

      const sortedResult = await this.dataSource.query(sortQuery, [
        searchTerm,
        pageSize,
        skip,
      ]);

      let myReactions: UserReactionsOutType[];

      if (userId) {
        const reactionsResult = await this.dataSource.query(
          `
          SELECT reaction_type, post_id
          FROM blogs b
          INNER JOIN posts ON b.id = posts.blog_id
          INNER JOIN post_reactions ON posts.id = post_reactions.post_id
          WHERE user_id = $1
        `,
          [userId],
        );

        myReactions = reactionsResult;
      }

      const findReactionsQuery = `
        SELECT pr.user_id, pr.reaction_type, pr.user_login, pr.liked_at
        FROM post_reactions pr
        LEFT JOIN post_reaction_counts
        ON pr.post_id = post_reaction_counts.post_id
        WHERE reaction_type = 'Like'
        ORDER BY liked_at DESC
        LIMIT 3
      `;

      const latestReactions = await this.dataSource.query(findReactionsQuery);

      const reactionCounter = await this.dataSource.query(
        `
        SELECT likes_count, dislikes_count, post_id
        FROM post_reaction_counts
        `,
      );

      const [postsCounter] = await this.dataSource.query(
        `
          SELECT COUNT(*)
          FROM posts
          WHERE content ILIKE $1
        `,
        [searchTerm],
      );

      const postsViewModel = new PaginationViewModel<PostViewModelType>(
        sortedResult.map((rawPost: PostsSqlDbType) =>
          getPostSqlViewModel(
            rawPost,
            latestReactions,
            reactionCounter,
            myReactions,
          ),
        ),
        pageNumber,
        pageSize,
        postsCounter.count,
      );

      return postsViewModel;
    } catch (error) {
      throw new InternalServerErrorException(
        `Database fails operation with find all posts ${error}`,
      );
    }
  }

  async getPostsByBlogId(
    blogId: string,
    queryOptions: PostsQueryFilter,
    userId?: string,
  ): Promise<PaginationViewModel<PostViewModelType> | null> {
    try {
      const { searchContentTerm } = queryOptions;

      const { pageNumber, pageSize, skip, sortBy, sortDirection } =
        getPagination(queryOptions, !!0, !0);

      const searchTerm = `%${searchContentTerm ? searchContentTerm : ''}%`;

      const sortQuery = `
      SELECT *
        FROM posts
        WHERE content ILIKE $1 AND blog_id = $2
        ORDER BY ${sortBy} ${sortDirection}
        LIMIT $3 OFFSET $4
      `;

      const result = await this.dataSource.query(sortQuery, [
        searchTerm,
        blogId,
        pageSize,
        skip,
      ]);

      let myReactions: UserReactionsOutType[];

      if (userId) {
        const reactionsResult = await this.dataSource.query(
          `
          SELECT reaction_type, post_id
          FROM blogs b
          INNER JOIN posts ON b.id = posts.blog_id
          INNER JOIN post_reactions ON posts.id = post_reactions.post_id
          WHERE user_id = $1
        `,
          [userId],
        );

        myReactions = reactionsResult.reaction_type;
      }

      const findReactionsQuery = `
        SELECT pr.user_id, pr.reaction_type, pr.user_login, pr.liked_at
        FROM post_reactions pr
        LEFT JOIN post_reaction_counts
        ON pr.post_id = post_reaction_counts.post_id
        WHERE pr.post_id = $1 AND reaction_type = 'Like'
        ORDER BY liked_at DESC
        LIMIT 3
      `;

      const latestReactions = await this.dataSource.query(
        findReactionsQuery,
        result.id,
      );

      const reactionCounter = await this.dataSource.query(
        `
        SELECT likes_count, dislikes_count, post_id
        FROM post_reaction_counts
        `,
      );

      const [postsCounter] = await this.dataSource.query(
        `
          SELECT COUNT(*)
          FROM posts
          WHERE content ILIKE $1 and blog_id = $2
        `,
        [searchTerm, blogId],
      );

      const postsViewModel = new PaginationViewModel<PostViewModelType>(
        result.map((rawPost: PostsSqlDbType) =>
          getPostSqlViewModel(
            rawPost,
            latestReactions,
            reactionCounter,
            myReactions,
          ),
        ),
        pageNumber,
        pageSize,
        postsCounter.count,
      );

      return postsViewModel;
    } catch (e) {
      console.error(`Database fails operation with find post by blogId ${e}`);
      return null;
    }
  }

  // async getUserReactions(
  //   userId: string,
  //   postId: string,
  // ): Promise<likesStatus | null> {
  //   try {
  //     const foundedUserReaction = await this.PostModel.findById(
  //       new ObjectId(postId),
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

  //     return foundedUserReaction.likesUserInfo[0].status;
  //   } catch (error) {
  //     console.error(`Database fails operate with find user's reactions`);
  //     return null;
  //   }
  // }

  async getPostById(
    postId: string,
    userId?: string,
  ): Promise<PostViewModelType | null> {
    try {
      let myReaction: likesStatus = likesStatus.None;

      if (userId) {
        const [reactionResult] = await this.dataSource.query<
          { reaction_type: likesStatus }[]
        >(
          `
            SELECT reaction_type
            FROM post_reactions
            WHERE post_id = $1 AND user_id = $2
          `,
          [postId, userId],
        );

        myReaction = reactionResult.reaction_type;
      }

      const reactionCounter = await this.dataSource.query(
        `
        SELECT *
          FROM post_reaction_counts
          WHERE post_id = $1
        `,
        [postId],
      );

      const reactionsQuery = `
          SELECT user_id, reaction_type, user_login, liked_at
          FROM post_reactions
          WHERE post_id = $1 AND reaction_type = 'Like'
          ORDER BY liked_at DESC
          LIMIT 3
        `;

      const latestReactions = await this.dataSource.query(reactionsQuery, [
        postId,
      ]);

      const findQuery = `
        SELECT *
        FROM posts
        WHERE id = $1
      `;

      const result = await this.dataSource.query<PostsSqlDbType[]>(findQuery, [
        postId,
      ]);

      if (!result) return null;

      return getPostSqlViewModel(
        result[0],
        latestReactions,
        reactionCounter,
        myReaction,
      );
    } catch (error) {
      console.error(`Database fails operate during find post ${error}`);
      return null;
    }
  }
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  PostsSqlDbType,
  UserReactionsOutType,
  UserPostReactionsType,
} from '../models/output.post.models/output.post.models';
import { PostViewModelType } from '../models/post.view.models/post-view-model.type';
import { getPostSqlViewModel } from '../models/post.view.models/post-view-sql.model';
import { PaginationViewModel } from '../../../../domain/sorting-base-filter';
import { PostsQueryFilter } from '../models/output.post.models/posts-query.filter';
import { getPagination } from '../../../../infra/utils/pagination';
import { likesStatus } from '../../../../domain/likes.types';
import { Post } from '../../domain/entities/post.entity';
import { getPostTORViewModel } from '../models/post.view.models/post-view-typeorm.model';
import { PostReaction } from '../../domain/entities/post-reactions.entity';
import { seedAllData } from '../../../../infra/utils/seed/seed-data';

@Injectable()
export class PostsTORQueryRepo {
  constructor(
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    @InjectRepository(PostReaction)
    private readonly postReactions: Repository<PostReaction>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  // async getAllPosts(
  //   queryOptions: PostsQueryFilter,
  //   userId?: string,
  // ): Promise<PaginationViewModel<PostViewModelType>> {
  //   try {
  //     const { searchContentTerm } = queryOptions;
  //     const isSql = true;

  //     const { pageNumber, pageSize, skip, sortBy, sortDirection } =
  //       getPagination(queryOptions, !!0, isSql);

  //     const searchTerm = `%${searchContentTerm ? searchContentTerm : ''}%`;
  //     //(select count(*) from post_reactions) as likesCount

  //     const sortQuery =
  //       // sortBy !== 'created_at'
  //       //   ?
  //       //   `
  //       //   SELECT *
  //       //     FROM posts p
  //       //     WHERE content ILIKE $1
  //       //     ORDER BY ${sortBy} COLLATE "C" ${sortDirection}
  //       //     LIMIT $2 OFFSET $3
  //       //   `
  //       //   :
  //       `
  //         SELECT p.*
  //           FROM posts p
  //           WHERE content ILIKE $1
  //           ORDER BY ${sortBy} ${sortDirection}
  //           LIMIT $2 OFFSET $3
  //         `;

  //     const sortedResult = await this.dataSource.query(sortQuery, [
  //       searchTerm,
  //       pageSize,
  //       skip,
  //     ]);

  //     let myReactions: UserReactionsOutType[];

  //     if (userId) {
  //       const reactionsResult = await this.dataSource.query(
  //         `
  //         SELECT reaction_type, post_id
  //         FROM blogs b
  //         INNER JOIN posts ON b.id = posts.blog_id
  //         INNER JOIN post_reactions ON posts.id = post_reactions.post_id
  //         WHERE post_reactions.user_id = $1
  //       `,
  //         [userId],
  //       );

  //       myReactions = reactionsResult;
  //     }

  //     const findReactionsQuery = `
  //       SELECT pr.user_id, pr.reaction_type, pr.user_login, pr.liked_at, pr.post_id
  //       FROM post_reactions pr
  //       WHERE reaction_type = 'Like'
  //       ORDER BY liked_at DESC
  //     `;

  //     const latestReactions = await this.dataSource.query(findReactionsQuery);

  //     const reactionCounter = await this.dataSource.query(
  //       `
  //       SELECT likes_count, dislikes_count, post_id
  //       FROM post_reaction_counts
  //       `,
  //     );

  //     const [postsCounter] = await this.dataSource.query(
  //       `
  //         SELECT COUNT(*)
  //         FROM posts
  //         WHERE content ILIKE $1
  //       `,
  //       [searchTerm],
  //     );

  //     const postsViewModel = new PaginationViewModel<PostViewModelType>(
  //       sortedResult.map((rawPost: PostsSqlDbType) =>
  //         getPostSqlViewModel(
  //           rawPost,
  //           latestReactions,
  //           reactionCounter,
  //           myReactions,
  //         ),
  //       ),
  //       pageNumber,
  //       pageSize,
  //       postsCounter.count,
  //     );

  //     return postsViewModel;
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       `Database fails operation with find all posts ${error}`,
  //     );
  //   }
  // }

  async getPostsByBlogId(
    blogId: string,
    queryOptions: PostsQueryFilter,
    userId?: string,
  ): Promise<PaginationViewModel<PostViewModelType> | null | void> {
    try {
      const { searchContentTerm } = queryOptions;
      const isSql = true;
      const isMongo = true;
      const { pageNumber, pageSize, skip, sortBy, sortDirection } =
        getPagination(queryOptions, !isMongo, isSql);

      const searchTerm = `%${searchContentTerm ? searchContentTerm : ''}%`;

      const queryBuilder = this.posts.createQueryBuilder('posts');

      queryBuilder
        .where('posts.content ILIKE :searchTerm', { searchTerm })
        .andWhere('posts.blog_id = :blogId', { blogId })
        // .leftJoinAndSelect('posts.blog', 'blog')
        .orderBy(
          sortBy !== 'created_at'
            ? `posts.${sortBy} COLLATE 'C'`
            : `posts.created_at`,
          sortDirection,
        )
        .skip(skip)
        .take(pageSize);

      const result = await queryBuilder.getManyAndCount();
      console.log(result[0]);

      let myReactions: UserReactionsOutType[] | likesStatus = likesStatus.None;
          userId = '93cbe5fc-0df7-4124-8fda-b7bb86ca98fe'
      if (userId) {
        const reactions = await this.postReactions.find({
          where: {
            user: {
              id: userId
            },
            post: {
              blog: {
                id: blogId
              }
            }
          }
        });
        console.log('userId', {reactions});

        // myReactions = reactionsResult;
      }

      const latestReactions = await this.postReactions
        .createQueryBuilder('pr')
        .select([
          'pr.user_id',
          'pr.reaction_type',
          'pr.user_login',
          'pr.created_at',
          'pr.post_id',
        ])
        .innerJoinAndSelect('pr.post', 'posts')
        .leftJoin('posts.blog', 'b')
        .leftJoin('pr.user', 'user')
        .where('pr.reaction_type = :reactionType', {
          reactionType: likesStatus.Like,
        })
        .andWhere('posts.blog_id = :blogId', { blogId })
        .orderBy('pr.created_at', 'DESC')
        .limit(3)
        .getMany();
        const transformedReactions = latestReactions.map(reaction => ({
          ...reaction,
          // post_id: reaction.post.id,
          post: reaction.post.id,
        }));
      console.log( transformedReactions );

      // const postsViewModel = new PaginationViewModel<PostViewModelType>(
      //   result.map((rawPost: PostsSqlDbType) =>
      //     getPostSqlViewModel(
      //       rawPost,
      //       latestReactions,
      //       reactionCounter,
      //       myReactions,
      //     ),
      //   ),
      //   pageNumber,
      //   pageSize,
      //   postsCounter.count,
      // );

      // return postsViewModel;
    } catch (e) {
      console.error(`Database fails operation with find posts by blogId ${e}`);
      return null;
    }
  }

  // // async getUserReactions(
  // //   userId: string,
  // //   postId: string,
  // // ): Promise<likesStatus | null> {
  // //   try {
  // //     const foundedUserReaction = await this.PostModel.findById(
  // //       new ObjectId(postId),
  // //       {
  // //         likesUserInfo: {
  // //           $elemMatch: {
  // //             userId,
  // //             status: { $exists: true },
  // //           },
  // //         },
  // //       },
  // //     );

  // //     if (!foundedUserReaction) return null;

  // //     return foundedUserReaction.likesUserInfo[0].status;
  // //   } catch (error) {
  // //     console.error(`Database fails operate with find user's reactions`);
  // //     return null;
  // //   }
  // // }

  async getPostById(
    postId: string,
    userId?: string,
  ): Promise<PostViewModelType | null> {
    try {
      let myReaction: likesStatus = likesStatus.None;

      const queryBuilder = this.posts.createQueryBuilder('posts');

      queryBuilder
        .where('posts.id = :postId', { postId })
        .leftJoinAndSelect('posts.postReactionCounts', 'prc')
        .leftJoin('posts.blog', 'b')
        .addSelect('b.id');

      const result = await queryBuilder.getOne();

      if (!result) return null;

      const latestReactions = await this.postReactions
        .createQueryBuilder('pr')
        .select([
          'pr.user_id',
          'pr.reaction_type',
          'pr.user_login',
          'pr.created_at',
          'pr.post_id',
        ])
        .addSelect('user.id', 'user_id')
        .where('pr.post_id = :postId', { postId })
        .andWhere('pr.reaction_type = :reactionType', {
          reactionType: likesStatus.Like,
        })
        .leftJoin('pr.user', 'user')
        .orderBy('pr.created_at', 'DESC')
        .limit(3)
        .getMany();

      if (userId) {
        const post = await this.posts.findOne({
          where: {
            id: postId,
            postReactions: { user: { id: userId } },
          },
          relations: ['postReactions'],
        });
        console.log(post);

        // if (post) myReaction = post.postReactions
      }
      console.log({ latestReactions });

      return getPostTORViewModel(result, latestReactions, myReaction);
    } catch (error) {
      console.error(`Database fails operate during find post ${error}`);
      return null;
    }
  }
}

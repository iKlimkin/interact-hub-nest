import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostsSqlDbType } from '../models/output.post.models/output.post.models';
import { PostViewModelType } from '../models/post.view.models/post-view-model.type';
import { getPostSqlViewModel } from '../models/post.view.models/post-view-sql.model';
import { PaginationViewModel } from '../../../../domain/sorting-base-filter';
import { PostsQueryFilter } from '../models/output.post.models/posts-query.filter';
import { getPagination } from '../../../../infra/utils/pagination';

@Injectable()
export class PostsSqlQueryRepo {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  // async getAllPosts(
  //   inputData: PostsQueryFilter,
  //   userId?: string,
  // ): Promise<PaginationViewModel<PostViewModelType>> {
  //   const { pageNumber, pageSize, sort, skip } = getPagination(inputData);
  //   const { searchContentTerm } = inputData;

  //   const filter = getSearchTerm({ searchContentTerm });

  //   try {
  //     const posts = await this.PostModel.find(filter)
  //       .sort(sort)
  //       .skip(skip)
  //       .limit(pageSize)
  //       .lean()
  //       .exec();

  //     const totalCount = await this.PostModel.countDocuments(filter);
  //     const pagesCount = Math.ceil(totalCount / pageSize);

  //     return {
  //       pagesCount,
  //       page: pageNumber,
  //       pageSize,
  //       totalCount,
  //       items: posts.map((post) => getPostViewModel(post, userId)),
  //     };
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Database fails operate with find posts',
  //     );
  //   }
  // }

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

      const query = `
      SELECT *
        FROM posts
        WHERE content ILIKE $1 AND blog_id = $2
        ORDER BY ${sortBy} ${sortDirection}
        LIMIT $3 OFFSET $4
      `;

      const result = await this.dataSource.query(query, [
        searchTerm,
        blogId,
        pageSize,
        skip,
      ]);

      const [countResult] = await this.dataSource.query(
        `
          SELECT COUNT(*)
          FROM blogs
          WHERE title ILIKE $1
        `,
        [searchTerm],
      );

      const postsViewModel = new PaginationViewModel<PostViewModelType>(
        result.map(getPostSqlViewModel),
        pageNumber,
        pageSize,
        countResult.count,
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
      const findQuery = `
      SELECT *
      FROM posts
      WHERE id = $1
    `;

      const result = await this.dataSource.query<PostsSqlDbType>(findQuery, [
        postId,
      ]);

      if (!result) return null;

      return getPostSqlViewModel(result[0]);
    } catch (error) {
      console.error(`Database fails operate during find post ${error}`);
      return null;
    }
  }
}

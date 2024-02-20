import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationViewModel } from '../../../../domain/sorting-base-filter';
import { BaseModel } from '../../../../infra/utils/base-query-pagination-model';
import { getPagination } from '../../../../infra/utils/pagination';
import { getSearchTerm } from '../../../../infra/utils/search-term-finder';
import { Blog, BlogModelType } from '../../domain/entities/blog.schema';
import { BlogViewModelType } from '../models/output.blog.models/blog.view.model-type';
import {
  BlogDBType,
  BlogType,
  BlogsSqlDbType,
} from '../models/output.blog.models/blog.models';
import { BlogsQueryFilter } from '../models/input.blog.models/blogs-query.filter';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { getBlogSqlViewModel } from '../models/output.blog.models/blog-sql.view.model';

@Injectable()
export class BlogsSqlQueryRepo {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAllBlogs(
    queryOptions: BlogsQueryFilter,
  ): Promise<PaginationViewModel<BlogViewModelType> | null> {
    try {
      const { searchNameTerm } = queryOptions;

      const { pageNumber, pageSize, skip, sortBy, sortDirection } =
        await getPagination(queryOptions, !!0, !0);

      const searchTerm = `%${searchNameTerm ? searchNameTerm : ''}%`;

      const query = `
      SELECT *
        FROM blogs
        WHERE title ILIKE $1
        ORDER BY ${sortBy} ${sortDirection}
        LIMIT $2 OFFSET $3
      `;

      const result = await this.dataSource.query(query, [
        searchTerm,
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

      const blogsViewModel = new PaginationViewModel<BlogViewModelType>(
        result.map(getBlogSqlViewModel),
        pageNumber,
        pageSize,
        countResult.count,
      );

      return blogsViewModel;
    } catch (e) {
      console.error(`Some troubles occurred during find blogs: ${e}`);
      return null;
    }
  }

  async getBlogById(blogId: string): Promise<BlogViewModelType | null> {
    try {
      const findQuery = `
          SELECT *
          FROM blogs
          WHERE id = $1
        `;

      const result = await this.dataSource.query<BlogsSqlDbType>(findQuery, [
        blogId,
      ]);

      if (!result) return null;

      return getBlogSqlViewModel(result[0]);
    } catch (error) {
      console.error(`Some troubles occurred during find blog by id${error}`);
      return null;
    }
  }

  // async getBlogsByQuery(
  //   inputData: BlogsQueryFilter,
  // ): Promise<PaginationViewModel<BlogViewModelType>> {
  //   const { searchNameTerm } = inputData;
  //   const { pageNumber, pageSize, sort, skip } = await getPagination(inputData);

  //   const filter = getSearchTerm({ searchNameTerm });

  //   try {
  //     const blogs = await this.BlogModel.find(filter)
  //       .sort(sort)
  //       .skip(skip)
  //       .limit(pageSize);

  //     const totalCount = await this.BlogModel.countDocuments(filter);

  //     const blogModel = new this.BlogModel();

  //     const blogsViewModel = new PaginationViewModel<BlogViewModelType>(
  //       blogs.map(blogModel.getBlogsViewModel),
  //       pageNumber,
  //       pageSize,
  //       totalCount,
  //     );

  //     return blogsViewModel;
  //   } catch (e) {
  //     throw new Error(`There're something problems with find blogs: ${e}`);
  //   }
  // }
}

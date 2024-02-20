import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PaginationViewModel } from '../../../../domain/sorting-base-filter';
import { getPagination } from '../../../../infra/utils/pagination';
import { BlogsQueryFilter } from '../models/input.blog.models/blogs-query.filter';
import { getBlogSqlViewModel } from '../models/output.blog.models/blog-sql.view.model';
import { BlogsSqlDbType } from '../models/output.blog.models/blog.models';
import { BlogViewModelType } from '../models/output.blog.models/blog.view.model-type';

@Injectable()
export class BlogsSqlQueryRepo {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAllBlogs(
    queryOptions: BlogsQueryFilter,
  ): Promise<PaginationViewModel<BlogViewModelType> | null> {
    try {
      const { searchNameTerm } = queryOptions;

      const { pageNumber, pageSize, skip, sortBy, sortDirection } =
        getPagination(queryOptions, !!0, !0);

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
}

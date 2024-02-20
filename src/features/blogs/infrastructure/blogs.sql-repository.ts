import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OutputId } from '../../../domain/likes.types';
import { BlogDtoSqlType } from '../api/models/blog-sql.model';
import { UpdateBlogCommandType } from '../api/models/input.blog.models/update-blog-models';
import { BlogsSqlDbType } from '../api/models/output.blog.models/blog.models';

// export interface IBlogsRepository {
//   save(smartBlogModel: BlogDocument): Promise<OutputId>;
//   getBlogById(blogId: string): Promise<BlogDBType | null>;

//   updateBlog(blogId: string, updateData: UpdateBlogModel): Promise<boolean>;

//   deleteBlog(blogId: string): Promise<BlogDBType>;
// }

@Injectable()
export class BlogsSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async save(blogDto: BlogDtoSqlType): Promise<OutputId | null> {
    try {
      const createQuery = `
        INSERT INTO blogs
        (title, description, website_url)
        VALUES ($1, $2, $3)
        RETURNING *
      `;

      const result = await this.dataSource.query<BlogsSqlDbType>(
        createQuery,
        Object.values(blogDto),
      );

      return {
        id: result[0].id,
      };
    } catch (error) {
      console.error(`Database fails operate during creation blog ${error}`);
      return null;
    }
  }

  async getBlogById(blogId: string): Promise<BlogsSqlDbType | null> {
    try {
      const findQuery = `
        SELECT *
        FROM blogs
        WHERE id = $1
      `;

      const result = await this.dataSource.query<BlogsSqlDbType[]>(findQuery, [
        blogId,
      ]);

      if (!result) return null;

      return result[0];
    } catch (error) {
      console.error(`Database fails operate during get blog by id ${error}`);
      return null;
    }
  }

  async updateBlog(updateBlogDto: UpdateBlogCommandType): Promise<boolean> {
    try {
      const updateQuery = `
        UPDATE blogs
        SET title = $1, description = $2, website_url = $3
        WHERE id = $4
      `;
      const result = await this.dataSource.query(
        updateQuery,
        Object.values(updateBlogDto),
      );

      return result[1] > 0;
    } catch (e) {
      console.error(`Database fails operate during the upgrade blog`, e);
      return false;
    }
  }

  async deleteBlog(blogId: string): Promise<boolean> {
    try {
      const deleteQuery = `
        DELETE
        FROM blogs
        WHERE id = $1
      `;

      const result = await this.dataSource.query(deleteQuery, [blogId]);

      return result[1] > 0;
    } catch (error) {
      console.error(`Database fails operate during the delete blog`, error);
      return false;
    }
  }
}

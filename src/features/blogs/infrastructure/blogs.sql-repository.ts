import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateBlogModel } from '../api/models/input.blog.models/UpdateBlogModel';
import {
  BlogDBType,
  BlogsSqlDbType,
} from '../api/models/output.blog.models/blog.models';
import {
  Blog,
  BlogDocument,
  BlogModelType,
} from '../domain/entities/blog.schema';
import { OutputId } from '../../../domain/likes.types';
import { ObjectId } from 'mongodb';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogDBSqlType } from '../api/models/blog-sql.model';

// export interface IBlogsRepository {
//   save(smartBlogModel: BlogDocument): Promise<OutputId>;
//   getBlogById(blogId: string): Promise<BlogDBType | null>;

//   updateBlog(blogId: string, updateData: UpdateBlogModel): Promise<boolean>;

//   deleteBlog(blogId: string): Promise<BlogDBType>;
// }

@Injectable()
export class BlogsSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async save(blogDto: BlogDBSqlType): Promise<OutputId | null> {
    try {
      const query = `
        INSERT INTO blogs
        (title, description, website_url)
        VALUES ($1, $2, $3)
        RETURNING *
      `;

      const result = await this.dataSource.query<BlogsSqlDbType>(
        query,
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

  // async getBlogById(blogId: string): Promise<BlogDBType | null> {
  //   try {
  //     const foundedBlog = await this.BlogModel.findById(
  //       new ObjectId(blogId),
  //     ).lean();

  //     if (!foundedBlog) return null;

  //     return {
  //       ...foundedBlog,
  //     };
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Database fails operate during the find blog',
  //     );
  //   }
  // }

  // async updateBlog(
  //   blogId: string,
  //   updateData: UpdateBlogModel,
  // ): Promise<boolean> {
  //   try {
  //     const result = await this.BlogModel.updateOne(
  //       { _id: new ObjectId(blogId) },
  //       {
  //         $set: {
  //           name: updateData.name,
  //           description: updateData.description,
  //           websiteUrl: updateData.websiteUrl,
  //         },
  //       },
  //     );
  //     return result.matchedCount === 1;
  //   } catch (e) {
  //     console.error(`Database fails operate during the upgrade blog`, e);
  //     return false;
  //   }
  // }

  // async deleteBlog(blogId: string): Promise<BlogDBType> {
  //   try {
  //     return this.BlogModel.findByIdAndDelete(new ObjectId(blogId)).lean();
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Database fails operate during removal operation',
  //     );
  //   }
  // }
}

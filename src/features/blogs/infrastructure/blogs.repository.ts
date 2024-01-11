import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OutputId } from 'src/infra/likes.types';
import { UpdateBlogModel } from '../api/models/input.blog.models/UpdateBlogModel';
import {
  BlogDBType
} from '../api/models/output.blog.models/blog.models';
import {
  Blog,
  BlogDocument,
  BlogModelType,
} from '../domain/entities/blog.schema';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async save(smartBlogModel: BlogDocument): Promise<OutputId> {
    try {
      const blogDb = await smartBlogModel.save();

      return {
        id: blogDb._id.toString(),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate during the creation blog',
      );
    }
  }

  async getBlogById(blogId: string): Promise<BlogDBType | null> {
    try {
      const foundedBlog = await this.BlogModel.findById(blogId).lean();

      if (!foundedBlog) return null;

      return {
        ...foundedBlog,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate during the find blog',
      );
    }
  }

  async updateBlog(
    blogId: string,
    updateData: UpdateBlogModel,
  ): Promise<BlogModelType | null> {
    try {
      return this.BlogModel.findByIdAndUpdate(blogId, {
        $set: {
          name: updateData.name,
          description: updateData.description,
          websiteUrl: updateData.websiteUrl,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(
        'Database fails operate during the upgrade blog',
      );
    }
  }

  async deleteBlog(blogId: string): Promise<boolean> {
    try {
      return this.BlogModel.findByIdAndDelete(blogId).lean();
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate during removal operation',
      );
    }
  }
}

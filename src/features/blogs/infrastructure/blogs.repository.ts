import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UpdateBlogModel } from '../api/models/input.blog.models/UpdateBlogModel';
import {
  BlogDBType,
  BlogType,
} from '../api/models/output.blog.models/blog.models';
import { OutputId } from 'src/infra/likes.types';
import { InjectModel } from '@nestjs/mongoose';
import {
  Blog,
  BlogDocument,
  BlogModelDocumentType,
  BlogModelType,
} from '../blog.schema';
import { Model } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async create(blogDto: Readonly<BlogType>): Promise<OutputId> {
    try {
      const createdBlog = await this.BlogModel.create(blogDto);

      return {
        id: createdBlog._id.toString(),
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

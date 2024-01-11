import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OutputId } from 'src/infra/likes.types';
import { UpdateBlogModel } from '../api/models/input.blog.models/UpdateBlogModel';
import { CreateBlogModelType } from '../api/models/input.blog.models/create.blog.model';
import { Blog, BlogModelType } from '../domain/entities/blog.schema';
import { BlogsRepository } from '../infrastructure/blogs.repository';

@Injectable()
export class BlogsService {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType,
  private blogsRepository: BlogsRepository) {}

  async createBlog(createData: CreateBlogModelType): Promise<OutputId> {
    const smartBlogModel = this.BlogModel.makeInstance(createData);

    return await this.blogsRepository.save(smartBlogModel);
  }

  async updateBlog(
    blogId: string,
    updateData: UpdateBlogModel,
  ): Promise<BlogModelType | null> {
    return await this.blogsRepository.updateBlog(blogId, {
      name: updateData.name,
      description: updateData.description,
      websiteUrl: updateData.websiteUrl,
    });
  }

  async deleteBlog(blogId: string): Promise<boolean> {
    return await this.blogsRepository.deleteBlog(blogId);
  }
}

import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { CreateBlogModelType } from '../api/models/input.blog.models/create.blog.model';
import { OutputId } from 'src/infra/likes.types';
import { UpdateBlogModel } from '../api/models/input.blog.models/UpdateBlogModel';
import { Blog, BlogModelType } from '../blog.schema';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}

  async createBlog(createData: CreateBlogModelType): Promise<OutputId> {
    const blogDto = Blog.makeInstance({
      name: createData.name,
      description: createData.description,
      websiteUrl: createData.websiteUrl,
    });

    return await this.blogsRepository.create(blogDto);
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

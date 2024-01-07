import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { CreateBlogModel } from '../api/models/inputBlogsModels/CreateBlogModel';
import { OutputId } from 'src/features/general-models/likes.types';
import { UpdateBlogModel } from '../api/models/inputBlogsModels/UpdateBlogModel';
import { Blog, BlogModelType } from '../blog.schema';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}

  async createBlog(createData: CreateBlogModel): Promise<OutputId> {
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

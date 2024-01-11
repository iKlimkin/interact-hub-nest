import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OutputId } from 'src/infra/likes.types';
import { UpdateBlogModel } from '../api/models/input.blog.models/UpdateBlogModel';
import {
  CreateBlogModelType,
  InputBlogModel,
} from '../api/models/input.blog.models/create.blog.model';
import { Blog, BlogModelType } from '../domain/entities/blog.schema';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { validateOrReject } from 'class-validator';

const validateOrRejectModel = async (
  model: InputBlogModel,
  ctor: { new (): InputBlogModel },
) => {
  if (model! instanceof ctor) {
    throw new Error('Incorrect input blog data');
  }
  try {
    await validateOrReject(model);
  } catch (error) {
    throw new Error(error);
  }
};

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
  ) {}

  async createBlog(inputModel: InputBlogModel): Promise<OutputId> {
    await validateOrRejectModel(inputModel, InputBlogModel);
    
    const smartBlogModel = await this.BlogModel.makeInstance(inputModel);

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

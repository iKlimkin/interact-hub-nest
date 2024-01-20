import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BlogDBType, BlogType } from '../models/output.blog.models/blog.models';
import { getPagination } from '../../../../infra/utils/pagination';
import { BlogViewModel } from '../models/blog.view.models/blog.view.models';
import { getBlogViewModel } from '../models/blog.view.models/getBlogViewModel';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../domain/entities/blog.schema';
import { BaseModel } from '../../../../infra/utils/BasePaginationModel';
import { getSearchTerm } from '../../../../infra/utils/searchTerm';
import { SortingQueryModel } from '../../../../infra/SortingQueryModel';
import { PaginationViewModel } from '../../../../infra/paginationViewModel';

@Injectable()
export class BlogsQueryRepo {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async getAllBlogs(
    inputData: SortingQueryModel,
  ): Promise<PaginationViewModel<BlogType>> {
    try {
      return await BaseModel.paginateAndTransform<BlogDBType, BlogViewModel>(
        this.BlogModel,
        getBlogViewModel,
        inputData,
      );
    } catch (e) {
      throw new Error(
        `There're something problems with find blogs by query: ${e}`,
      );
    }
  }

  async getBlogById(blogId: string): Promise<BlogViewModel | null> {
    try {
      const foundedBlog = await this.BlogModel.findById(blogId);

      if (!foundedBlog) return null;

      return getBlogViewModel(foundedBlog);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getBlogsByQuery(
    inputData: SortingQueryModel,
  ): Promise<PaginationViewModel<BlogType>> {
    const { searchNameTerm } = inputData;
    const { pageNumber, pageSize, sort, skip } = await getPagination(inputData);

    const filter = getSearchTerm({ searchNameTerm });

    try {
      const blogs = await this.BlogModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(pageSize);

      const totalCount = await this.BlogModel.countDocuments(filter);
      const pagesCount = Math.ceil(totalCount / pageSize);

      return {
        pagesCount: pagesCount,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCount,
        items: blogs.map(getBlogViewModel),
      };
    } catch (e) {
      throw new Error(`There're something problems with find blogs: ${e}`);
    }
  }
}

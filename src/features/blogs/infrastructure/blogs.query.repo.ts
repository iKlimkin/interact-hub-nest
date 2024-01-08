import { PaginationViewModel } from '../../infra/paginationViewModel';
import { getSearchTerm } from '../../infra/utils/searchTerm';
import { BaseModel } from '../../infra/utils/BasePaginationModel';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  BlogDBType,
  BlogType,
} from '../api/models/output.blog.models/blog.models';
import { SortingQueryModel } from 'src/features/infra/SortingQueryModel';
import { getPagination } from 'src/features/infra/utils/pagination';
import { BlogViewModel } from '../api/models/blog.view.models/blog.view.models';
import { getBlogViewModel } from '../api/models/blog.view.models/getBlogViewModel';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../blog.schema';

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
      throw new InternalServerErrorException('Database fails operation');
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

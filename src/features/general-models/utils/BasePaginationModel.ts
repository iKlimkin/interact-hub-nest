import { SortingQueryModel } from '../SortingQueryModel';
import { getPagination } from './pagination';
import { PaginationViewModel } from '../paginationViewModel';
import { Model } from 'mongoose';

export class BaseModel {
  static async paginateAndTransform<T, U>(
    query: Model<T>,
    getViewModel: any,
    inputData: SortingQueryModel,
  ): Promise<PaginationViewModel<U>> {
    const { pageNumber, pageSize, sort, skip } = await getPagination(inputData);

    try {
      const items = await query.find().sort(sort).skip(skip).limit(pageSize);

      const totalCount = await query.countDocuments();
      const pagesCount = Math.ceil(totalCount / pageSize);

      return {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount,
        items: items.map(getViewModel),
      };
    } catch (error) {
      console.error('Pagination error:', error);
      throw error;
    }
  }
}

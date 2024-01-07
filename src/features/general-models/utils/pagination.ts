import { Sort, SortDirection } from 'mongodb';
import { SortingQueryModel } from '../SortingQueryModel';

export type PaginationType = {
  sort: Record<string, SortDirection>;
  pageNumber: number;
  pageSize: number;
  skip: number;
};

export const getPagination = async (
  inputData: SortingQueryModel,
): Promise<PaginationType> => {
  let sortDirection = inputData.sortDirection === 'asc' ? 1 : -1;
  let pageNumber = inputData.pageNumber
    ? Math.min(+inputData.pageNumber, 50)
    : 1;
  let pageSize = inputData.pageSize ? Math.min(+inputData.pageSize, 50) : 10;
  let sortBy = inputData.sortBy ? inputData.sortBy : 'createdAt';

  const skip = (pageNumber - 1) * pageSize;

  const sort: Record<string, SortDirection> = {
    [sortBy]: sortDirection as SortDirection,
  };

  return {
    sort,
    pageNumber,
    pageSize,
    skip,
  };
};

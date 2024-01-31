import { SortDirection } from 'mongodb';
import { BaseFilter } from '../../domain/sorting-base-filter';

export type PaginationType = {
  sort: Record<string, SortDirection>;
  pageNumber: number;
  pageSize: number;
  skip: number;
};

export const getPagination = async (
  inputData: BaseFilter,
  option?: boolean,
): Promise<PaginationType> => {

  const sortDirection: SortDirection =
    inputData.sortDirection === 'asc' ? 1 : -1;

  const pageNumber: number = inputData.pageNumber
    ? Math.min(+inputData.pageNumber, 50)
    : 1;

  const pageSize: number = inputData.pageSize
    ? Math.min(+inputData.pageSize, 50)
    : 10;

  const skip: number = (pageNumber - 1) * pageSize;

  const getDefaultSort = (sortBy: string): Record<string, SortDirection> => ({
    [sortBy]: sortDirection,
  });

  const getUserAccountSort = (
    sortBy: string,
  ): Record<string, SortDirection> => {
    const sortingKeyMap: Record<string, string> = {
      login: 'accountData.login',
      email: 'accountData.email',
    };

    const sortingKey: string = sortingKeyMap[sortBy] || `accountData.createdAt`;

    return {
      [sortingKey]: sortDirection,
    };
  };

  const sortBy: string = inputData.sortBy || 'createdAt';

  const sort: Record<string, SortDirection> = option
    ? getUserAccountSort(sortBy)
    : getDefaultSort(sortBy);

  return {
    sort,
    pageNumber,
    pageSize,
    skip,
  };
};


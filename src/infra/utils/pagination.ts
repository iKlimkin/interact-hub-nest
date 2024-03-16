import { SortDirection } from 'mongodb';
import { BaseFilter, convertSortBy } from '../../domain/sorting-base-filter';

enum sortDirections {
  ASC = 'ASC',
  DESC = 'DESC',
}

type SortDirectionsType = keyof typeof sortDirections;

export type PaginationType = {
  sort: Record<string, SortDirection>;
  pageNumber: number;
  pageSize: number;
  skip: number;
  sortBy: string;
  sortDirection: SortDirectionsType;
};

export type SortOptions = {
  sortDirection: string;
  sortBy: string;
};

type SortDirections = SortDirection | SortDirectionsType;

export const getPagination = (
  inputData: BaseFilter,
  userAccountOptions?: boolean,
  sqlOptions: boolean = false,
): PaginationType => {
  let sortDirection: SortDirections;
  let sortBy: string;

  if (sqlOptions) {
    sortDirection = inputData.sortDirection === 'asc' ? 'ASC' : 'DESC';
    sortBy = inputData.sortBy || 'created_at';
  } else {
    sortDirection = inputData.sortDirection === 'asc' ? 1 : -1;
    sortBy = inputData.sortBy || 'createdAt';
  }

  const pageNumber: number = inputData.pageNumber
    ? Math.min(+inputData.pageNumber, 50)
    : 1;

  const pageSize: number = inputData.pageSize
    ? Math.min(+inputData.pageSize, 50)
    : 10;

  const skip: number = (pageNumber - 1) * pageSize;

  const getDefaultSort = (sortBy: string): Record<string, SortDirection> => ({
    [sortBy]: sortDirection as SortDirection,
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
      [sortingKey]: sortDirection as SortDirection,
    };
  };

  const sort: Record<string, SortDirection> = userAccountOptions
    ? getUserAccountSort(sortBy)
    : getDefaultSort(sortBy);

  return {
    sort,
    pageNumber,
    pageSize,
    skip,
    sortBy,
    sortDirection: sortDirection as SortDirectionsType,
  };
};

const validateSortBy = (sortBySql: string): string => {
  const allowedColumns = [
    'id',
    'name',
    'description',
    'websiteUrl',
    'createdAt',
    'isMembership',
  ];

  return allowedColumns.includes(sortBySql) ? convertSortBy[sortBySql] : '';
};

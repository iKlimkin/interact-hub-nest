export type SortingQueryModel = {
  /**
   * pageNumber is number of portions
   */
  pageNumber: number;

  /**
   * pageSize is portions size
   */
  pageSize: number;

  /**
   * sortBy regarding the date
   */
  sortBy: string;

  /**
   * sorting by ascending or descending values
   */
  sortDirection: 'asc' | 'desc';

  searchNameTerm?: string;

  searchEmailTerm?: string;

  searchLoginTerm?: string;

  searchContentTerm?: string;
};

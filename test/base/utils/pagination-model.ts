import { BaseFilter } from '../../../src/domain/sorting-base-filter';
import { SortOptions } from '../../../src/infra/utils/pagination';



export class PaginationModel<T> {
  getData(
    data: PaginationModelData<T>,
    query?: BaseFilter,
  ): PaginationModelData<T> {
    const { pagesCount, page, pageSize, totalCount, items } = data;

    let cItems = [...items]

    if (query?.searchEmailTerm || query?.searchLoginTerm) {
      cItems = this.filterQueryTerms(cItems, query);
    }

    if (query?.sortBy || query?.sortDirection) {
      cItems = this.sortingEntities(cItems, {
        sortBy: query.sortBy,
        sortDirection: query.sortDirection,
      });
    }

    return {
      pagesCount: pagesCount ? pagesCount : 0,
      page: page ? page : 1,
      pageSize: pageSize ? pageSize : 10,
      totalCount: totalCount ? totalCount : 0,
      items: cItems ? cItems : [],
    };
  }

  private filterQueryTerms(data, query) {
    if (query.searchEmailTerm || query.searchLoginTerm) {
      return data.filter((e) => {
        const emailMatch = query.searchEmailTerm
          ? e.email.includes(query.searchEmailTerm)
          : !0;

        const loginMatch = query.searchLoginTerm
          ? e.login.includes(query.searchLoginTerm)
          : !0;

        return emailMatch || loginMatch;
      });
    }

    return data;
  }

  private sortingEntities(data, sortOptions: SortOptions) {
    return data.sort((a, b) => {
      const fieldA = a[sortOptions.sortBy] || a['createdAt'];
      const fieldB = b[sortOptions.sortBy] || b['createdAt'];

      if (sortOptions.sortDirection === 'asc') {
        return fieldA.localeCompare(fieldB);
      }

      if (sortOptions.sortDirection === 'desc') {
        return fieldB.localeCompare(fieldA);
      }

      return 0;
    });
  }
}

type PaginationModelData<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
};

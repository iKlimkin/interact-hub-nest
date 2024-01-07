import { SortingQueryModel } from '../../../../general-models/SortingQueryModel';

export type SortingWithSearchName = SortingQueryModel & {
  /**
   *  Search term for blog Name
   */
  searchNameTerm: string;

  searchEmailTerm?: string;

  searchLoginTerm?: string;
};

export type SortingWithSearchContent = SortingQueryModel & {
  /**
   *  Search term for blog Name
   */
  searchContentTerm: string;
};

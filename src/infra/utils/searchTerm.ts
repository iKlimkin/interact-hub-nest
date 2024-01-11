export interface SearchTerms {
  searchEmailTerm?: string | null;
  searchLoginTerm?: string | null;
  searchNameTerm?: string | null;
  searchContentTerm?: string | null;
}

export type SearchTermKeys = keyof SearchTerms;

interface Filter {
  [key: string]:
    | { $regex: string | null | undefined; $options: string }
    | Array<{
        [key: string]: { $regex: string | null | undefined; $options: string };
      }>;
}

export const getSearchTerm = (
  searchTerms: SearchTerms,
  option?: boolean,
): Filter => {
  const filter: Filter = {};

  const {
    searchNameTerm,
    searchEmailTerm,
    searchLoginTerm,
    searchContentTerm,
  } = searchTerms;

  const addFilter = (field: string, term: string) =>
    (filter[field] = { $regex: term, $options: 'i' });

  if (searchEmailTerm && searchLoginTerm && !option) {
    filter['$or'] = [
      { email: { $regex: searchEmailTerm, $options: 'i' } },
      { login: { $regex: searchLoginTerm, $options: 'i' } },
    ];
  }

  if ((searchEmailTerm || searchLoginTerm) && option) {
    filter['$or'] = [
      { 'accountData.email': { $regex: searchEmailTerm, $options: 'i' } },
      { 'accountData.login': { $regex: searchLoginTerm, $options: 'i' } },
    ];
  }

  if (searchLoginTerm && !option) addFilter('login', searchLoginTerm);

  if (searchEmailTerm && !option) addFilter('email', searchEmailTerm);

  if (searchContentTerm && !option) addFilter('content', searchContentTerm);

  if (searchNameTerm && !option) addFilter('name', searchNameTerm);

  return filter;
};

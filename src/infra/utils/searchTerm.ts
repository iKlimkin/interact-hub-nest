export interface SearchTerms {
  searchEmailTerm?: string | null;
  searchLoginTerm?: string | null;
  searchNameTerm?: string | null;
  searchContentTerm?: string | null;
}

export type SearchTermKeys = keyof SearchTerms;

interface Filter {
  [key: string]: { $regex: string | null | undefined; $options: string } | Array<{ [key: string]: { $regex: string | null | undefined; $options: string } }>;
}

export const getSearchTerm = (
  searchTerms: SearchTerms
): Filter => {

  const filter: Filter = {};

  const { searchNameTerm, searchEmailTerm, searchLoginTerm, searchContentTerm } = searchTerms

  const addFilter = (field: string, term: string) => filter[field] = { $regex: term, $options: "i" };

  if (searchEmailTerm && searchLoginTerm) {
    filter["$or"] = [
      { email: { $regex: searchEmailTerm, $options: "i" } },
      { login: { $regex: searchLoginTerm, $options: "i" } },
    ];
  }

  if (searchLoginTerm) addFilter("login", searchLoginTerm);
  
  if (searchEmailTerm) addFilter("email", searchEmailTerm);
  
  if (searchContentTerm) addFilter('content', searchContentTerm)
  
  if (searchNameTerm) addFilter('name', searchNameTerm)
  
  return filter;
};

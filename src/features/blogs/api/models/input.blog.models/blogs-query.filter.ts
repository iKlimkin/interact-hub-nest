import { BaseFilter } from "../../../../../domain/sorting-base-filter";


export class BlogsQueryFilter extends BaseFilter {
    pageNumber: string;
    pageSize: string;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    searchNameTerm: string;
} 
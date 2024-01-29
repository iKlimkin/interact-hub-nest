import { BaseFilter } from "../../../../../domain/sorting-base-filter";


export class BlogsQueryFilter extends BaseFilter {
    pageNumber: number;
    pageSize: number;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    searchNameTerm: string;
} 
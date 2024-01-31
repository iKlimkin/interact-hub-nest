import { BaseFilter } from "../../../../../domain/sorting-base-filter";

export class SAQueryFilter extends BaseFilter {
    pageNumber: string;
    pageSize: string;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    searchEmailTerm: string;
    searchLoginTerm: string;
} 
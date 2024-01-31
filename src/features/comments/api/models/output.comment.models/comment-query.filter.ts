import { BaseFilter } from "../../../../../domain/sorting-base-filter";

export class CommentsQueryFilter extends BaseFilter {
    pageNumber: string;
    pageSize: string;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
} 
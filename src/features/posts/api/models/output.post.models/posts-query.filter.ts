import { IsOptional } from "class-validator";
import { BaseFilter } from "../../../../../domain/sorting-base-filter";


export class PostsQueryFilter extends BaseFilter {
    pageNumber: string;
    pageSize: string;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    @IsOptional()
    searchContentTerm: string;
} 
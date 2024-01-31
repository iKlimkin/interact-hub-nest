import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  isURL,
} from 'class-validator';
import { SortDirection } from 'mongodb';

enum SortDirections {
  Asc = 'asc',
  Desc = 'desc',
}

export abstract class BaseFilter {
  @IsOptional()
  @IsString()
  abstract sortBy: string;

  // @IsEnum(SortDirections)
  @IsOptional()
  @IsString()
  abstract sortDirection: string;

  @IsOptional()
  @IsString()
  // @Min(1)
  // @Max(51)
  abstract pageSize: string;

  @IsOptional()
  @IsString()
  // @Min(1)
  // @Max(51)
  abstract pageNumber: string;

  @IsOptional()
  @IsString()
  searchNameTerm: string;

  @IsOptional()
  @IsString()
  searchEmailTerm: string;

  @IsOptional()
  @IsString()
  searchLoginTerm: string;

  @IsOptional()
  @IsString()
  searchContentTerm: string;
}

export class PaginationViewModel<P> {
  public readonly pagesCount: number;
  public readonly page: number;
  public readonly pageSize: number;
  public readonly totalCount: number;
  public readonly items: P[];

  constructor(items: P[], page: number, pageSize: number, totalCount: number) {
    this.pagesCount = Math.ceil(totalCount / pageSize);
    this.page = page;
    this.pageSize = pageSize;
    this.totalCount = totalCount;
    
    this.items = items;
  }
}

type QueryType = Record<string, string | string[]>;

export class PaginationFilter {
  public readonly pageNumber: number;
  public readonly pageSize: number;
  public readonly sortDirection: SortDirection;
  public readonly sortBy: string;

  constructor(query: QueryType, sortProperties: string[] = []) {
    this.sortBy = this.getSortBy(query, sortProperties);
    this.sortDirection = this.getSortDirection(query);
    this.pageNumber = query.pageNumber ? Math.min(+query.pageNumber, 50) : 1;
    this.pageSize = query.pageSize ? Math.min(+query.pageSize, 50) : 10;
  }

  public getSortDirectionInNumericFormat(): number {
    return this.sortDirection === 'asc' ? 1 : -1;
  }

  public getSkipItemsCount() {
    return (this.pageNumber - 1) * this.pageSize;
  }

  public getSortDirection(query: QueryType) {
    let sortDirection: SortDirection = query.sortDirection === 'asc' ? 1 : -1;
    return sortDirection;
  }

  public getSortBy(query: QueryType, sortProperties: string[]): string {
    let result = 'createdAt';

    const querySortBy = query.sortBy;

    if (Array.isArray(querySortBy)) {
      for (let i = 0; i < querySortBy.length; i++) {
        const param = querySortBy[i] + '';

        if (sortProperties.includes(param)) {
          result = param;
          break;
        }
      }
    } else {
      if (sortProperties.includes(querySortBy.toString())) {
        result = querySortBy.toString();
      }
    }

    return result;
  }
}

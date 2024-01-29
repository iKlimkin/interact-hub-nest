import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export abstract class BaseFilter {
  @IsString()
  abstract sortBy: string;

  // @IsEnum(SortDirection)
  @IsString()
  abstract sortDirection: string;

  @IsNumber()
  @Min(1)
  @Max(50)
  abstract pageSize: number;

  @IsNumber()
  @Min(1)
  @Max(50)
  abstract pageNumber: number;

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



export type SortingQueryModel = {
  /**
   * pageNumber is number of portions
   */
  pageNumber: number;

  /**
   * pageSize is portions size
   */
  pageSize: number;

  /**
   * sortBy regarding the date
   */
  sortBy: string;

  /**
   * sorting by ascending or descending values
   */
  sortDirection: 'asc' | 'desc';

  searchNameTerm?: string;

  searchEmailTerm?: string;

  searchLoginTerm?: string;

  searchContentTerm?: string;
};


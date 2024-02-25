import { IsIn, IsOptional } from 'class-validator';
import { BaseFilter } from '../../../../../domain/sorting-base-filter';
import { Transform } from 'class-transformer';

export class SAQueryFilter extends BaseFilter {
  pageNumber: string;
  pageSize: string;

  @IsOptional()
  @IsIn(['email', 'login', 'createdAt'], { message: ({ value }) => `Invalid sortBy parameter: ${value}`})
  sortBy: string;

  @IsIn(['asc', 'desc'], { message: ({ value }) => `Invalid sortDirection parameter: ${value}` })
  @Transform(({ value }) => value.toLowerCase() === 'asc' ? 'asc' : 'desc' as const)
  sortDirection: 'asc' | 'desc';

  searchEmailTerm: string;
  searchLoginTerm: string;
}

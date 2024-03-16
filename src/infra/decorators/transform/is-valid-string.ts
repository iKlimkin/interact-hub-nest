import { applyDecorators } from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import {
  SortDirections,
  convertSortBy,
  sortingKeys,
} from '../../../domain/sorting-base-filter';

export const iSValidField = ({ min, max }, regexOption?: RegExp) => {
  const decorators = [
    Length(min, max, { message: `range of values [${min}, ${max}] ` }),
    IsNotEmpty(),
    Trim(),
    IsString(),
  ];

  if (regexOption) {
    decorators.unshift(
      Matches(regexOption, { message: "field doesn't match" }),
    );
  }

  return applyDecorators(...decorators);
};

export const Trim = () =>
  Transform(({ value }: TransformFnParams) => value?.trim());

export const ValidateSortBy = () =>
  Transform(({ value }: TransformFnParams) => {
    const isValue = sortingKeys.includes(value);
    return (
      !isValue
        ? convertSortBy.createdAt
        : convertSortBy[value]
    )
});


export const ValidSortDirection = () =>
  Transform(({ value }: TransformFnParams): SortDirections => {
    const values = Object.values(SortDirections);
    const lowerValue = value.toLowerCase();

    return !value || !values.includes(lowerValue)
      ? SortDirections.Desc
      : lowerValue;
  });

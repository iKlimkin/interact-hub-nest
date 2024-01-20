import { applyDecorators } from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

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

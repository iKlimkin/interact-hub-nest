import { applyDecorators } from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export const iSValidString = ({ min, max }) =>
  applyDecorators(Length(min, max, { message: `range of values [${min}, ${max}] ` }), IsNotEmpty(), Trim(), IsString());

export const Trim = () =>
  Transform(({ value }: TransformFnParams) => value?.trim());

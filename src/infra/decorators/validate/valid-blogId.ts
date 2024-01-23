import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { BlogsQueryRepo } from '../../../features/blogs/api/query-repositories/blogs.query.repo';

@ValidatorConstraint({ name: 'BlogIdIsExist', async: true })
@Injectable()
export class BlogIdExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsQueryRepo: BlogsQueryRepo) {}

  async validate(value: any, args: ValidationArguments) {
    const existBlog = await this.blogsQueryRepo.getBlogById(value);
    if (!existBlog) throw new BadRequestException([{field: 'blogId', message: 'blog not found'}])
    return true
  }
}

export function BlogIdIsExist(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: BlogIdExistConstraint,
    });
  };
}

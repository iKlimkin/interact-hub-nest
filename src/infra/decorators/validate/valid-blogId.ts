import { Inject, Injectable } from "@nestjs/common";
import { ValidationOptions, registerDecorator, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from "class-validator";
import { BlogsQueryRepo } from "src/features/blogs/api/query-repositories/blogs.query.repo";


@ValidatorConstraint({ name: 'BlogIdIsExist', async: true })
@Injectable()
export class BlogIdExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsQueryRepo: BlogsQueryRepo) {}

  async validate(value: any, args: ValidationArguments) {
    const existBlog = await this.blogsQueryRepo.getBlogById(value);
    return !!existBlog;
  }
}

export function BlogIdIsExist(property?: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: BlogIdExistConstraint,
    });
  };
}

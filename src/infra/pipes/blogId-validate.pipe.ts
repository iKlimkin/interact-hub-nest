import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { BlogsQueryRepo } from '../../features/blogs/api/query-repositories/blogs.query.repo';

@Injectable()
export class BlogIdValidationPipe implements PipeTransform {
  constructor(private readonly blogsQueryRepo: BlogsQueryRepo) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    const blogId = value.blogId;

    if (!blogId) {
      throw new BadRequestException('blogId is required in the request body');
    }

    const blogExists = await this.blogsQueryRepo.getBlogById(blogId);

    if (!blogExists) {
      throw new BadRequestException('Invalid blogId');
    }

    return value;
  }
}

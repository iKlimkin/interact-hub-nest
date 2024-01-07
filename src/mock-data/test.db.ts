import { Injectable } from '@nestjs/common';
import { Blog, BlogModelType } from '../features/blogs/blog.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from 'src/features/posts/posts.schema';

@Injectable()
export class TestDatabaseRepo {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
  ) {}

  async deleteAllData() {
    await Promise.all([
      this.BlogModel.deleteMany(),
      this.PostModel.deleteMany(),
    ]);
  }
}

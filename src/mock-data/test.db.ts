import { Injectable } from '@nestjs/common';
import {
  Blog,
  BlogModelType,
} from '../features/blogs/domain/entities/blog.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
  Post,
  PostModelType,
} from 'src/features/posts/domain/entities/posts.schema';
import {
  UserAccount,
  UserAccountModelType,
} from 'src/features/admin/domain/entities/userAccount.schema';
import {
  CommentModelType,
  Comment,
} from 'src/features/comments/domain/entities/comment.schema';
import {
  Security,
  SecurityModelType,
} from 'src/features/security/domain/entities/security.schema';

@Injectable()
export class TestDatabaseRepo {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(UserAccount.name)
    private UserAccountModel: UserAccountModelType,
    @InjectModel(Security.name) private SecurityModel: SecurityModelType,
  ) {}

  async deleteAllData() {
    await Promise.all([
      this.BlogModel.deleteMany(),
      this.PostModel.deleteMany(),
      this.CommentModel.deleteMany(),
      this.UserAccountModel.deleteMany(),
      this.SecurityModel.deleteMany(),
    ]);
  }
}

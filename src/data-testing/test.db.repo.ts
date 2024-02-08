import { Injectable } from '@nestjs/common';
import {
  Blog,
  BlogModelType,
} from '../features/blogs/domain/entities/blog.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
  Post,
  PostModelType,
} from '../features/posts/domain/entities/posts.schema';
import {
  UserAccount,
  UserAccountModelType,
} from '../features/admin/domain/entities/userAccount.schema';
import {
  CommentModelType,
  Comment,
} from '../features/comments/domain/entities/comment.schema';
import {
  Security,
  SecurityModelType,
} from '../features/security/domain/entities/security.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestDatabaseRepo {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(UserAccount.name)
    private UserAccountModel: UserAccountModelType,
    @InjectModel(Security.name) private SecurityModel: SecurityModelType,
  ) {}

  async deleteAllData() {
    const sqlDataSource = this.dataSource.query(`
      delete from "user_accounts";
    `);

    await Promise.all([
      this.BlogModel.deleteMany(),
      this.PostModel.deleteMany(),
      this.CommentModel.deleteMany(),
      this.UserAccountModel.deleteMany(),
      this.SecurityModel.deleteMany(),
      sqlDataSource
    ]);
  }
}

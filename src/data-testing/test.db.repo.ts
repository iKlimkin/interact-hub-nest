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
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
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
    try {
      const sqlDataSource = this.dataSource.query(`
      DELETE FROM post_reactions_m;
      DELETE FROM post_reaction_counts_m;
      DELETE FROM comment_reactions_m;
      DELETE FROM comment_reaction_counts_m;
      DELETE FROM comments;
      DELETE FROM posts;
      DELETE FROM blogs;
      DELETE FROM user_sessions;
      DELETE FROM user_accounts;
      DELETE FROM api_requests;
      TRUNCATE TABLE temporary_user_account;
      TRUNCATE TABLE user_session CASCADE;
      TRUNCATE TABLE user_account CASCADE;
    `);

      await Promise.all([
        this.BlogModel.deleteMany(),
        this.PostModel.deleteMany(),
        this.CommentModel.deleteMany(),
        this.UserAccountModel.deleteMany(),
        this.SecurityModel.deleteMany(),
        sqlDataSource,
      ]);
    } catch (error) {
      console.error('Error executing SQL queries:', error);
    }
  }
}

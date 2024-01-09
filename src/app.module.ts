import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsController } from './features/blogs/api/controllers/blogs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './features/blogs/blog.schema';
import { Post, PostSchema } from './features/posts/posts.schema';
import { BlogsService } from './features/blogs/domain/blogs.service';
import { BlogsQueryRepo } from './features/blogs/infrastructure/blogs.query.repo';
import { BlogsRepository } from './features/blogs/infrastructure/blogs.repository';
import { PostsService } from './features/posts/domain/posts.service';
import { PostsQueryRepository } from './features/posts/infrastructure/posts.query.repo';
import { PostsRepository } from './features/posts/infrastructure/posts.repository';
import { TestDatabaseRepo } from './mock-data/test.db';
import { TestDatabaseController } from './mock-data/test.db.contoller';
import {
  UserAccount,
  UserAccountSchema,
} from './features/admin/userAccount.schema';
import { UsersQueryRepository } from './features/admin/infrastructure/users.query.repo';
import { PostsController } from './features/posts/api/controllers/posts.controller';
import { CommentSchema, Comment } from './features/comments/comment.schema';
import { FeedbacksQueryRepository } from './features/comments/infrastructure/feedbacks.query.repository';
import { FeedbacksRepository } from './features/comments/infrastructure/feedbacks.repository';
import { UsersRepository } from './features/admin/infrastructure/users.repository';
import { FeedbacksService } from './features/comments/domain/feedbacks.service';
import { AdminUserService } from './features/admin/domain/user.admins.service';
import { AdminUserController } from './features/admin/api/controllers/admin-users.controller';
import { FeedbacksController } from './features/comments/api/controllers/feedbacks.controller';
import settings from 'src/infra/settings/app.settings';
import { BcryptAdapter } from './infra/adapters/bcrypt-adapter';
import { EmailAdapter } from './infra/adapters/email-adapter';
import { JwtService } from './infra/application/jwt-service';

@Module({
  imports: [
    MongooseModule.forRoot(settings.MONGO_URL),
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: BlogSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
      {
        name: UserAccount.name,
        schema: UserAccountSchema,
      },
      {
        name: Comment.name,
        schema: CommentSchema,
      },
    ]),
  ],
  controllers: [
    AppController,

    AdminUserController,

    BlogsController,

    PostsController,

    FeedbacksController,

    TestDatabaseController,
  ],
  providers: [
    AppService,

    JwtService,

    BcryptAdapter,
    EmailAdapter,

    BlogsService,
    BlogsQueryRepo,
    BlogsRepository,

    PostsService,
    PostsQueryRepository,
    PostsRepository,

    AdminUserService,
    UsersQueryRepository,
    UsersRepository,

    FeedbacksService,
    FeedbacksQueryRepository,
    FeedbacksRepository,

    TestDatabaseRepo,
  ],
})
export class AppModule {}

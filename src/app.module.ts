import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import settings from 'src/infra/settings/app.settings';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminUserController } from './features/admin/api/controllers/admin-users.controller';
import { AdminUserService } from './features/admin/domain/user.admins.service';
import { UsersQueryRepository } from './features/admin/infrastructure/users.query.repo';
import { UsersRepository } from './features/admin/infrastructure/users.repository';
import { BlogsController } from './features/blogs/api/controllers/blogs.controller';
import { BlogsService } from './features/blogs/domain/blogs.service';
import { BlogsQueryRepo } from './features/blogs/infrastructure/blogs.query.repo';
import { BlogsRepository } from './features/blogs/infrastructure/blogs.repository';
import { FeedbacksController } from './features/comments/api/controllers/feedbacks.controller';
import { FeedbacksService } from './features/comments/domain/feedbacks.service';
import { FeedbacksQueryRepository } from './features/comments/infrastructure/feedbacks.query.repository';
import { FeedbacksRepository } from './features/comments/infrastructure/feedbacks.repository';
import { PostsController } from './features/posts/api/controllers/posts.controller';
import { PostsService } from './features/posts/domain/posts.service';
import { PostsQueryRepository } from './features/posts/infrastructure/posts.query.repo';
import { PostsRepository } from './features/posts/infrastructure/posts.repository';
import { BcryptAdapter } from './infra/adapters/bcrypt-adapter';
import { EmailAdapter } from './infra/adapters/email-adapter';
import { JwtService } from './infra/application/jwt-service';
import { TestDatabaseRepo } from './mock-data/test.db';
import { TestDatabaseController } from './mock-data/test.db.contoller';
import { mongooseSchemas } from './settings/mongoose-schemas';

@Module({
  imports: [
    MongooseModule.forRoot(settings.MONGO_URL),
    MongooseModule.forFeature(mongooseSchemas),
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

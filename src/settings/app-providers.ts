import { AppService } from 'src/app.service';
import { AdminUserService } from 'src/features/admin/application/user.admins.service';
import { UsersQueryRepository } from 'src/features/admin/api/query-repositories/users.query.repo';
import { UsersRepository } from 'src/features/admin/infrastructure/users.repository';
import { BlogsService } from 'src/features/blogs/application/blogs.service';
import { BlogsQueryRepo } from 'src/features/blogs/api/query-repositories/blogs.query.repo';
import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';
import { FeedbacksService } from 'src/features/comments/application/feedbacks.service';
import { FeedbacksQueryRepository } from 'src/features/comments/api/query-repositories/feedbacks.query.repository';
import { FeedbacksRepository } from 'src/features/comments/infrastructure/feedbacks.repository';
import { PostsService } from 'src/features/posts/application/posts.service';
import { PostsQueryRepository } from 'src/features/posts/api/query-repositories/posts.query.repo';
import { PostsRepository } from 'src/features/posts/infrastructure/posts.repository';
import { SecurityService } from 'src/features/security/application/security.service';
import { SecurityQueryRepo } from 'src/features/security/api/query-repositories/security.query.repo';
import { SecurityRepository } from 'src/features/security/infrastructure/security.repository';
import { BcryptAdapter } from 'src/infra/adapters/bcrypt-adapter';
import { EmailAdapter } from 'src/infra/adapters/email-adapter';
import { JwtService } from 'src/infra/application/jwt-service';
import { TestDatabaseRepo } from 'src/mock-data/test.db';

export const providers = [
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

  SecurityService,
  SecurityRepository,
  SecurityQueryRepo,

  TestDatabaseRepo,
];

import { Provider } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppService } from 'src/app.service';
import { BlogsQueryRepo } from 'src/features/blogs/api/query-repositories/blogs.query.repo';
import { BlogsService } from 'src/features/blogs/application/blogs.service';
import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';
import { FeedbacksQueryRepository } from 'src/features/comments/api/query-repositories/feedbacks.query.repository';
import { FeedbacksService } from 'src/features/comments/application/feedbacks.service';
import { FeedbacksRepository } from 'src/features/comments/infrastructure/feedbacks.repository';
import { PostsQueryRepository } from 'src/features/posts/api/query-repositories/posts.query.repo';
import { PostsService } from 'src/features/posts/application/posts.service';
import { PostsRepository } from 'src/features/posts/infrastructure/posts.repository';
import { SecurityQueryRepo } from 'src/features/security/api/query-repositories/security.query.repo';
import { ApiRequestCounterService } from 'src/infra/application/api-request-counter.service';
import { BlogIdExistConstraint } from 'src/infra/decorators/validate/valid-blogId';
import { RateLimitInterceptor } from 'src/infra/interceptors/rate-limit.interceptor.ts';
import { ApiRequestCounterRepository } from 'src/infra/repositories/api-request-counter.repository';
import { TestDatabaseRepo } from 'src/mock-data/test.db';

const blogsProviders: Provider[] = [
  BlogsService,
  BlogsQueryRepo,
  BlogsRepository,
];

const postsProviders: Provider[] = [
  PostsService,
  PostsQueryRepository,
  PostsRepository,
];

const feedbacksProviders: Provider[] = [
  FeedbacksService,
  FeedbacksQueryRepository,
  FeedbacksRepository,
];

const securitiesProviders: Provider[] = [
  SecurityQueryRepo,
];




export const providers = [
  AppService,

  ...blogsProviders,

  ...postsProviders,

  BlogIdExistConstraint,

  ...feedbacksProviders,

  ...securitiesProviders,

  TestDatabaseRepo,
];



// providers: [
//   AppService,

//   JwtService,

//   BcryptAdapter,
//   EmailAdapter,

//   BlogsService,
// BlogsQueryRepo,
// BlogsRepository,

// PostsService,
// PostsQueryRepository,
// PostsRepository,

//   BlogIdExistConstraint,

//   AdminUserService,
// UsersQueryRepository,
// UsersRepository,,

// FeedbacksService,
// FeedbacksQueryRepository,
// FeedbacksRepository,

// SecurityService,
// SecurityRepository,
// SecurityQueryRepo,

//   TestDatabaseRepo,
// ],

import { Provider } from '@nestjs/common';
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
import { BlogIdExistConstraint } from 'src/infra/decorators/validate/valid-blogId';
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

export const providers = [
  AppService,

  ...blogsProviders,

  ...postsProviders,

  BlogIdExistConstraint,

  ...feedbacksProviders,

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

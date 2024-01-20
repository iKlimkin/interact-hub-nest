import { Provider } from '@nestjs/common';
import { AppService } from '../app.service';
import { BlogsQueryRepo } from '../features/blogs/api/query-repositories/blogs.query.repo';
import { CreateBlogUseCase } from '../features/blogs/application/use-case/create-blog-use-case';
import { DeleteBlogUseCase } from '../features/blogs/application/use-case/delete-blog-use-case';
import { UpdateBlogUseCase } from '../features/blogs/application/use-case/update-blod-use-case';
import { BlogsRepository } from '../features/blogs/infrastructure/blogs.repository';
import { FeedbacksQueryRepository } from '../features/comments/api/query-repositories/feedbacks.query.repository';
import { FeedbacksService } from '../features/comments/application/feedbacks.service';
import { FeedbacksRepository } from '../features/comments/infrastructure/feedbacks.repository';
import { PostsQueryRepository } from '../features/posts/api/query-repositories/posts.query.repo';
import { PostsService } from '../features/posts/application/posts.service';
import { CreatePostUseCase } from '../features/posts/application/use-cases/create-post-use-case';
import { DeletePostUseCase } from '../features/posts/application/use-cases/delete-post-use-case';
import { UpdatePostUseCase } from '../features/posts/application/use-cases/update-post-use-case';
import { PostsRepository } from '../features/posts/infrastructure/posts.repository';
import { BlogIdExistConstraint } from '../infra/decorators/validate/valid-blogId';
import { ApiRequestCounterRepository } from '../infra/repositories/api-request-counter.repository';
import { TestDatabaseRepo } from '../mock-data/test.db';

const blogsProviders: Provider[] = [
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

const useCases: Provider[] = [
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,

  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
];

export const providers = [
  AppService,
  ApiRequestCounterRepository,
  ...useCases,

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

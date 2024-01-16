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
import { TestDatabaseRepo } from 'src/mock-data/test.db';
import { BlogIdValidationPipe } from 'src/infra/pipes/blogId-validate.pipe';
import { BlogIdExistConstraint } from 'src/infra/decorators/validate/valid-blogId';
import { Provider } from '@nestjs/common';
import { AuthQueryRepository } from 'src/features/auth/api/query-repositories/auth-query-repo';
import { AuthRepository } from 'src/features/auth/infrastructure/authUsers-repository';
import { EmailManager } from 'src/infra/application/managers/email-manager';
import { AuthUserService } from 'src/features/auth/application/auth.service';
import { AuthService } from 'src/infra/application/auth-service';
import { AuthModule } from 'src/features/auth/auth.module';



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
  // SecurityService,
  // SecurityRepository,
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

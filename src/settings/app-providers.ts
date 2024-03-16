import { Provider } from '@nestjs/common';
import { AppService } from '../app.service';
import { TestDatabaseRepo } from '../data-testing/test.db.repo';
import { BlogsQueryRepo } from '../features/blogs/api/query-repositories/blogs.query.repo';
import { CreateBlogUseCase } from '../features/blogs/application/use-case/create-blog-use-case';
import { DeleteBlogUseCase } from '../features/blogs/application/use-case/delete-blog-use-case';
import { UpdateBlogUseCase } from '../features/blogs/application/use-case/update-blog-use-case';
import { BlogsRepository } from '../features/blogs/infrastructure/blogs.repository';
import { FeedbacksQueryRepository } from '../features/comments/api/query-repositories/feedbacks.query.repository';
import { FeedbacksService } from '../features/comments/application/feedbacks.service';
import { CreateCommentUseCase } from '../features/comments/application/use-cases/create-comment.use-case';
import { DeleteCommentUseCase } from '../features/comments/application/use-cases/delete-comment.use-case';
import { UpdateCommentUseCase } from '../features/comments/application/use-cases/update-comment.use-case';
import { UpdateCommentReactionUseCase } from '../features/comments/application/use-cases/update-comment-reaction.use-case';
import { FeedbacksRepository } from '../features/comments/infrastructure/feedbacks.repository';
import { PostsQueryRepository } from '../features/posts/api/query-repositories/posts.query.repo';
import { PostsService } from '../features/posts/application/posts.service';
import { CreatePostUseCase } from '../features/posts/application/use-cases/create-post-use-case';
import { DeletePostUseCase } from '../features/posts/application/use-cases/delete-post-use-case';
import { UpdatePostUseCase } from '../features/posts/application/use-cases/update-post-use-case';
import { PostsRepository } from '../features/posts/infrastructure/posts.repository';
import { BlogIdExistConstraint } from '../infra/decorators/validate/valid-blogId';
import { ApiRequestCounterRepository } from '../infra/logging/infra/api-request-counter.repository';
import { BlogsSqlRepository } from '../features/blogs/infrastructure/blogs.sql-repository';
import { BlogsSqlQueryRepo } from '../features/blogs/api/query-repositories/blogs.query.sql-repo';
import { CreateBlogSqlUseCase } from '../features/blogs/application/use-case/create-blog-sql.use-case';
import { UpdateBlogSqlUseCase } from '../features/blogs/application/use-case/update-blog-sql.use-case';
import { DeleteBlogSqlUseCase } from '../features/blogs/application/use-case/delete-blog-sql.use-case';
import { CreatePostSqlUseCase } from '../features/posts/application/use-cases/create-post-sql.use-case';
import { PostsSqlRepository } from '../features/posts/infrastructure/posts.sql-repository';
import { PostsSqlQueryRepo } from '../features/posts/api/query-repositories/posts-query.sql-repo';
import { UpdatePostSqlUseCase } from '../features/posts/application/use-cases/update-post-sql.use-case';
import { DeletePostSqlUseCase } from '../features/posts/application/use-cases/delete-post-sql.use-case';
import { UpdatePostReactionSqlUseCase } from '../features/posts/application/use-cases/update-post-reaction-sql.use-case';
import { CreateCommentSqlUseCase } from '../features/comments/application/use-cases/create-comment-sql.use-case';
import { FeedbacksSqlRepo } from '../features/comments/infrastructure/feedbacks.sql-repository';
import { FeedbacksQuerySqlRepo } from '../features/comments/api/query-repositories/feedbacks.query.sql-repository';
import { UpdateCommentSqlUseCase } from '../features/comments/application/use-cases/update-comment-sql.use-case';
import { DeleteCommentSqlUseCase } from '../features/comments/application/use-cases/delete-comment-sql.use-case';
import { UpdateCommentReactionSqlUseCase } from '../features/comments/application/use-cases/update-comment-reaction-sql.use-case';
import { CreateBlogSASqlUseCase } from '../features/blogs/application/use-case/create-sa-blog-sql.use-case';
import { UpdateSABlogSqlUseCase } from '../features/blogs/application/use-case/update-sa-blog-sql.use-case';

const blogsProviders: Provider[] = [
  BlogsQueryRepo,
  BlogsRepository,
  BlogsSqlRepository,
  BlogsSqlQueryRepo,
];

const postsProviders: Provider[] = [
  PostsService,
  PostsQueryRepository,
  PostsSqlQueryRepo,
  PostsRepository,
  PostsSqlRepository,
];

const feedbacksProviders: Provider[] = [
  FeedbacksService,
  FeedbacksQueryRepository,
  FeedbacksQuerySqlRepo,
  FeedbacksRepository,
  FeedbacksSqlRepo,
];

const useCases: Provider[] = [
  CreatePostUseCase,
  CreatePostSqlUseCase,
  UpdatePostUseCase,
  UpdatePostSqlUseCase,
  UpdatePostReactionSqlUseCase,
  DeletePostUseCase,
  DeletePostSqlUseCase,

  CreateBlogUseCase,
  CreateBlogSqlUseCase,
  CreateBlogSASqlUseCase,
  UpdateBlogUseCase,
  UpdateBlogSqlUseCase,
  UpdateSABlogSqlUseCase,
  DeleteBlogUseCase,
  DeleteBlogSqlUseCase,

  UpdateCommentUseCase,
  UpdateCommentSqlUseCase,
  CreateCommentUseCase,
  CreateCommentSqlUseCase,
  DeleteCommentUseCase,
  DeleteCommentSqlUseCase,
  UpdateCommentReactionUseCase,
  UpdateCommentReactionSqlUseCase,
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

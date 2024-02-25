import { AppController } from '../app.controller';
import { TestDatabaseController } from '../data-testing/test.db.controller';
import { BlogsSqlController } from '../features/blogs/api/controllers/blogs-sql.controller';
import { BlogsController } from '../features/blogs/api/controllers/blogs.controller';
import { FeedbacksController } from '../features/comments/api/controllers/feedbacks.controller';
import { PostsSqlController } from '../features/posts/api/controllers/posts-sql.controller';
import { PostsController } from '../features/posts/api/controllers/posts.controller';

export const controllers = [
  AppController,

  process.env.MAIN_DB === 'SQL' ? BlogsSqlController : BlogsController,

  process.env.MAIN_DB === 'SQL' ? PostsSqlController : PostsController,

  FeedbacksController,

  TestDatabaseController,
];

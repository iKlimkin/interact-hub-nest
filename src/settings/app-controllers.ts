import { AppController } from '../app.controller';
import { BlogsController } from '../features/blogs/api/controllers/blogs.controller';
import { FeedbacksController } from '../features/comments/api/controllers/feedbacks.controller';
import { PostsController } from '../features/posts/api/controllers/posts.controller';
import { SecurityController } from '../features/security/api/security.controller';
import { TestDatabaseController } from '../data-testing/test.db.controller';

export const controllers = [
  AppController,

  BlogsController,

  PostsController,

  FeedbacksController,

  // SecurityController,

  TestDatabaseController,
];

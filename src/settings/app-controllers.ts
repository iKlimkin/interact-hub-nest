import { AppController } from 'src/app.controller';
import { AdminUserController } from 'src/features/admin/api/controllers/admin-users.controller';
import { BlogsController } from 'src/features/blogs/api/controllers/blogs.controller';
import { FeedbacksController } from 'src/features/comments/api/controllers/feedbacks.controller';
import { PostsController } from 'src/features/posts/api/controllers/posts.controller';
import { SecurityController } from 'src/features/security/api/controllers/security.controller';
import { TestDatabaseController } from 'src/mock-data/test.db.contoller';

export const controllers = [
  AppController,

  AdminUserController,

  BlogsController,

  PostsController,

  FeedbacksController,

  SecurityController,

  TestDatabaseController,
];

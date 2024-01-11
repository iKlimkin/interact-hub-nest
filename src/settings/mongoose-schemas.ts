import {
  UserAccount,
  UserAccountSchema,
} from 'src/features/admin/domain/entities/userAccount.schema';
import {
  Blog,
  BlogSchema,
} from 'src/features/blogs/domain/entities/blog.schema';
import {
  CommentSchema,
  Comment,
} from 'src/features/comments/domain/entities/comment.schema';
import {
  PostSchema,
  Post,
} from 'src/features/posts/domain/entities/posts.schema';
import {
  Security,
  SecuritySchema,
} from 'src/features/security/domain/entities/security.schema';

export const mongooseSchemas = [
  {
    name: Blog.name,
    schema: BlogSchema,
  },
  {
    name: Post.name,
    schema: PostSchema,
  },
  {
    name: UserAccount.name,
    schema: UserAccountSchema,
  },
  {
    name: Comment.name,
    schema: CommentSchema,
  },
  {
    name: Security.name,
    schema: SecuritySchema,
  },
];

import {
  UserAccount,
  UserAccountSchema,
} from 'src/features/admin/domain/entities/userAccount.schema';
import { TempUserAccount, TempUserAccountSchema } from 'src/features/auth/domain/entities/temp-account.schema';
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
import { RequestCounter, ApiRequestCounterShema } from 'src/infra/repositories/api-request.schema';

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
  {
    name: TempUserAccount.name,
    schema: TempUserAccountSchema,
  },
  {
    name: RequestCounter.name,
    schema: ApiRequestCounterShema,
  },
];



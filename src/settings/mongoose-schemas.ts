import { UserAccount, UserAccountSchema } from "src/features/admin/userAccount.schema";
import { Blog, BlogSchema } from "src/features/blogs/blog.schema";
import { CommentSchema, Comment } from "src/features/comments/comment.schema";
import { PostSchema, Post } from "src/features/posts/posts.schema";
import { Security, SecuritySchema } from "src/features/security/security.schema";

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
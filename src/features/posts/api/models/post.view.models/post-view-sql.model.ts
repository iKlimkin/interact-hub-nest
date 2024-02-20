import { likesStatus } from '../../../../../domain/likes.types';
import { PostsSqlDbType } from '../output.post.models/output.post.models';
import { PostViewModelType } from './post-view-model.type';

export const getPostSqlViewModel = (
  post: PostsSqlDbType,
  userId?: string,
): PostViewModelType => {
  // const [status] = getLikeStatus(post.likesUserInfo, userId);

  return {
    id: post.id,
    title: post.title,
    shortDescription: post.short_description,
    content: post.content,
    blogId: post.blog_id,
    blogName: post.blog_title,
    createdAt: post.created_at.toISOString(),
    extendedLikesInfo: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: likesStatus.None,
      newestLikes: [
        {
          addedAt: 'addedAt',
          userId: 'userId',
          login: 'login',
        },
      ],
    },
  };
};

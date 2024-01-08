import { WithId } from 'mongodb';
import { LikesUserInfoType, likesStatus } from 'src/features/infra/likes.types';
import { getLikeStatus } from 'src/features/infra/utils/likesStatusFounder';
import { PostType } from '../output.post.models/output.post.models';
import { PostStatusInfo, PostViewModel } from './PostViewModel';

export type PostDBType = WithId<PostType>;

const transformLikesUserInfo = (
  likesUserInfo: LikesUserInfoType[],
): PostStatusInfo[] =>
  likesUserInfo
    .filter((like) => like.status === likesStatus.Like)
    .map((like) => ({
      addedAt: like.addedAt,
      userId: like.userId,
      login: like.login,
    }))
    .slice(-3)
    .reverse();

export const getPostViewModel = (
  post: PostDBType,
  userId?: string,
): PostViewModel => {
  const [status] = getLikeStatus(post.likesUserInfo, userId);

  return {
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
    extendedLikesInfo: {
      likesCount: post.likesCountInfo.likesCount,
      dislikesCount: post.likesCountInfo.dislikesCount,
      myStatus: status || likesStatus.None,
      newestLikes: transformLikesUserInfo(post.likesUserInfo),
    },
  };
};

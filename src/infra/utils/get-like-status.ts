import {
  LikeUserType,
  LikesUserInfoType,
  likesStatus,
} from '../../domain/likes.types';

export const getLikeStatus = (
  likesUserInfo: LikesUserInfoType[] | LikeUserType[],
  userId?: string,
): likesStatus[] =>
  likesUserInfo
    .filter((likeInfo) => likeInfo.userId === userId)
    .map((likeInfo) => likeInfo.status);

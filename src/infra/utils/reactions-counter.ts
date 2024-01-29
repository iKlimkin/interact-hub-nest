import {
  LikeUserType,
  LikesCountType,
  likesStatus,
} from '../../domain/likes.types';

export const countLikesAndDislikes = (
  likesUserInfo: LikeUserType[],
  userId?: string,
): LikesCountType => {
  let likesCount = 0;
  let dislikesCount = 0;
  let status = likesStatus.None;

  for (const info of likesUserInfo) {
    status = info.userId === userId ? info.status : status;
    if (info.status === 'Like') likesCount += 1;
    if (info.status === 'Dislike') dislikesCount += 1;
  }

  return { likesCount, dislikesCount, status };
};

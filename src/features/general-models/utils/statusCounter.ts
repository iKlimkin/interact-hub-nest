import { LikeStatusType } from '../likes.types';

type StatusCounter = {
  likesCount: number;
  dislikesCount: number;
};

export const getStatusCounting = (
  status: LikeStatusType,
  statusInRepo: LikeStatusType,
): StatusCounter => {
  let dislikesCount = 0;
  let likesCount = 0;

  switch (status) {
    case 'Like':
      if (statusInRepo === 'Dislike') {
        dislikesCount--;
        likesCount++;
      }
      if (statusInRepo === 'None') {
        likesCount++;
      }
      break;

    case 'Dislike':
      if (statusInRepo === 'Like') {
        dislikesCount++;
        likesCount--;
      } else if (statusInRepo === 'None') {
        dislikesCount++;
      }
      break;

    case 'None':
      if (statusInRepo === 'Like') {
        likesCount--;
      }
      if (statusInRepo === 'Dislike') {
        dislikesCount--;
      }
      break;
  }
  return { likesCount, dislikesCount };
};

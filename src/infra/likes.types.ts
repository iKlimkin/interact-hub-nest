export type OutputId = { id: string };

export type LikeUserType = {
  userId?: string;
  status: likesStatus;
};

export type likeUserInfo = LikesCountType &
  LikeUserType & { commentId?: string; login?: string; postId?: string };

export enum likesStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export type LikesUserInfoType = {
  userId: string;
  login: string;
  status: likesStatus;
  addedAt: string;
};

export type LikeStatusType = keyof typeof likesStatus;

export type InputLikeStatus = {
  likeStatus: likesStatus;
};

export type LikesCountType = {
  likesCount: number;
  dislikesCount: number;
  status?: likesStatus;
};

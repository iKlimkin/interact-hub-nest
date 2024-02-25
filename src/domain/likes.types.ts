import { Types } from 'mongoose';

export type OutputId = { id: string };
export type OutputObjectId = { id: Types.ObjectId };

export type LikeUserType = {
  userId?: string;
  status: likesStatus;
};

export type UpdateReactionModelType = {
  postId: string;
  userId: string;
  login: string;
  inputStatus: likesStatus;
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

export type ReactionCommentType = {
  commentId: string;
  userId: string;
  inputStatus: LikeStatusType;
  currentStatus: LikeStatusType | null;
};

export type ReactionPostDtoType = Omit<ReactionPostCountType, 'currentStatus'>;

export type ReactionCommentDto = Omit<ReactionCommentType, 'currentStatus'> & {
  likesCount: number;
  dislikesCount: number;
};

export type ReactionPostCountType = ReactionPostType & {
  likesCount: number;
  dislikesCount: number;
};

export type ReactionPostType = Omit<ReactionCommentType, 'commentId'> & {
  postId: string;
  userLogin: string;
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

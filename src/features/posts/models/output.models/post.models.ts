import {
  LikesCountType,
  LikesUserInfoType,
} from 'src/features/general-models/likes.types';

export type PostType = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;

  likesUserInfo: LikesUserInfoType[];

  likesCountInfo: LikesCountType;
};

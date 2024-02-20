import {
  LikesUserInfoType,
  LikesCountType,
} from '../../../../../domain/likes.types';

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

export type PostsSqlDbType = {
  id: string;
  blog_id: string;
  blog_title: string;
  title: string;
  short_description: string;
  content: string;
  created_at: Date;
};

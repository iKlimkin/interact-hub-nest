import { WithId } from 'mongodb';

export type BlogType = {
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

export type BlogsTypeWithId = BlogType & { id: string }

export type BlogDBType = WithId<BlogType>;

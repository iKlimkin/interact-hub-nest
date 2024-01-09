import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreatePostModel } from './models/input.posts.models/create.post.model';

import { PostType } from './models/output.post.models/output.post.models';
import { LikesUserInfoType, LikesCountType } from 'src/infra/likes.types';

export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument> & PostModelStaticType;
export type PostModelDocumentType = Model<PostDocument>;

const likesPostInfo = {
  userId: { type: String },
  status: { type: String },
  login: { type: String },
  addedAt: { type: String },
};

export const likesCountInfo = {
  likesCount: { type: Number, min: 0, default: 0 },
  dislikesCount: { type: Number, min: 0, default: 0 },
};

@Schema({
  timestamps: true,
})
export class Post {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  shortDescription: string;

  @Prop({ required: true, type: String })
  content: string;

  @Prop({ required: true, type: String })
  blogId: string;

  @Prop({ required: true, type: String })
  blogName: string;

  @Prop({ required: true, type: String })
  createdAt: string;

  @Prop({ type: [likesPostInfo], default: [] })
  likesUserInfo: LikesUserInfoType[];

  @Prop({ type: likesCountInfo })
  likesCountInfo: LikesCountType;

  static makeInstance(
    dto: CreatePostModel & { blogId: string; blogName: string },
  ): PostType {
    const post = new Post();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = dto.blogName;
    post.createdAt = new Date().toISOString();
    post.likesUserInfo = [];
    post.likesCountInfo = { likesCount: 0, dislikesCount: 0 };

    return post;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

export type PostModelStaticType = {
  makeInstance(dto: CreatePostModel): PostType;
};

export const postStaticMethods: PostModelStaticType = {
  makeInstance: Post.makeInstance,
};

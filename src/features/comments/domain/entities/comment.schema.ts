import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  CommentType,
  CreateCommentType,
} from '../../api/models/output.comment.models';
import { likesCountInfo } from '../../../posts/domain/entities/posts.schema';
import { HydratedDocument, Model } from 'mongoose';
import {
  likesStatus,
  LikesUserInfoType,
  LikesCountType,
} from 'src/infra/likes.types';

export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & CommentModelStaticType;
export type CommentWholeModelTypes = CommentModelType & CommentMethodsType;

const LikesUsersInfo = {
  userId: { type: String, default: null },
  status: { type: String, enum: likesStatus, default: likesStatus.None },
};

const commentatorInfoType = {
  userId: { type: String, required: true },
  userLogin: { type: String, required: true },
};

type CommentatorInfoType = {
  userId: string;
  userLogin: string;
};

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true, type: String })
  content: string;

  @Prop({ required: true, type: String })
  postId: string;

  @Prop({ type: { commentatorInfoType } })
  commentatorInfo: CommentatorInfoType;

  @Prop({ type: String, required: true })
  createdAt: string;

  @Prop({ type: [LikesUsersInfo] })
  likesUserInfo: LikesUserInfoType[];

  @Prop({ type: likesCountInfo })
  likesCountInfo: LikesCountType;

  static makeInstance(dto: CreateCommentType): CommentDocument {
    const comment = new this() as CommentDocument;
    comment.content = dto.content;
    comment.postId = dto.postId;
    comment.commentatorInfo = {
      userId: dto.commentatorInfo.userId,
      userLogin: dto.commentatorInfo.userLogin,
    };
    comment.createdAt = new Date().toISOString();
    comment.likesUserInfo = [];
    comment.likesCountInfo = { likesCount: 0, dislikesCount: 0 };

    return comment;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

export const commentStatics = {
  makeInstance: Comment.makeInstance,
};
const commentMethods = {
  someMethods: Comment.prototype,
};

type CommentMethodsType = typeof commentMethods;
type CommentModelStaticType = typeof commentStatics;

CommentSchema.methods = commentMethods;
CommentSchema.statics = commentStatics;
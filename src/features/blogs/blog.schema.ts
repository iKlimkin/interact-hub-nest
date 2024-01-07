import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogModel } from './api/models/inputBlogsModels/CreateBlogModel';
import { BlogType } from './api/models/outputModels/blog.models';

export type BlogDocument = HydratedDocument<Blog>;
export type BlogModelType = Model<BlogDocument> & BlogModelStaticType;
export type BlogModelDocumentType = Model<BlogDocument>

export type BlogModelStaticType = {
  makeInstance(dto: CreateBlogModel): BlogType;
};

@Schema()
export class Blog {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, type: String })
  websiteUrl: string;

  @Prop({ required: true, type: String })
  createdAt: string;

  @Prop({ required: true, type: Boolean, default: false })
  isMembership: boolean;

  static makeInstance(
    dto: CreateBlogModel,
  ): BlogType {
    const blog = new Blog();
      blog.name = dto.name,
      blog.description = dto.description,
      blog.websiteUrl = dto.websiteUrl,
      blog.createdAt = new Date().toISOString(),
      blog.isMembership = false

    return blog
  }
}

export const blogStaticMethods: BlogModelStaticType = {
  makeInstance: Blog.makeInstance,
};

export const BlogSchema = SchemaFactory.createForClass(Blog);

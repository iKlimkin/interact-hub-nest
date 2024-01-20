import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogModelType } from '../../api/models/input.blog.models/create.blog.model';
import { validateOrReject } from 'class-validator';

export type BlogDocument = HydratedDocument<Blog>;
export type BlogModelType = Model<BlogDocument> & StaticsType;
export type BlogWholeModelTypes = BlogModelType & MethodsType;

// @Schema({_id: false})
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

  static async makeInstance(dto: CreateBlogModelType): Promise<BlogDocument> {
    const blog = new this() as BlogDocument;
    (blog.name = dto.name),
      (blog.description = dto.description),
      (blog.websiteUrl = dto.websiteUrl),
      (blog.createdAt = new Date().toISOString()),
      (blog.isMembership = false);

    await validateOrReject(blog);
    return blog;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

const blogStatics = {
  makeInstance: Blog.makeInstance,
};
const blogMethods = {
  someMethods: Blog.prototype,
};

type StaticsType = typeof blogStatics;
type MethodsType = typeof blogMethods;

BlogSchema.statics = blogStatics;
BlogSchema.methods = blogMethods;

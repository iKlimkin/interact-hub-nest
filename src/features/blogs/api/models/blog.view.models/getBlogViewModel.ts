import { BlogDBType } from '../output.blog.models/blog.models';
import { BlogViewModel } from './blog.view.models';

export const getBlogViewModel = (blog: BlogDBType): BlogViewModel => ({
  id: blog._id.toString(),
  name: blog.name,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
  isMembership: blog.isMembership,
});

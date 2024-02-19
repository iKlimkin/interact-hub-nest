import { BlogViewModelType } from './blog.view.model-type';
import { BlogsSqlDbType } from './blog.models';

export const getBlogSqlViewModel = (
  blog: BlogsSqlDbType,
): BlogViewModelType => ({
  id: blog.id,
  name: blog.title,
  description: blog.description,
  websiteUrl: blog.website_url,
  createdAt: blog.created_at.toISOString(),
  isMembership: blog.is_membership,
});

import { BlogViewModelType } from '../../../src/features/blogs/api/models/output.blog.models/blog.view.model-type';

export const blogValidationErrors = {
  errorsMessages: expect.arrayContaining([
    { message: expect.any(String), field: 'name' },
    { message: expect.any(String), field: 'description' },
    { message: expect.any(String), field: 'websiteUrl' },
  ]),
};

export const blogEqualTo = {
  id: expect.any(String),
  name: expect.any(String),
  description: expect.any(String),
  websiteUrl: expect.any(String),
  isMembership: expect.any(Boolean),
  createdAt: expect.any(String),
} as BlogViewModelType;

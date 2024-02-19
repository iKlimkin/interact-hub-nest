import { HttpStatus, INestApplication } from '@nestjs/common';
import { InputBlogModel } from '../../../src/features/blogs/api/models/input.blog.models/create.blog.model';
import request from 'supertest';
import { RouterPaths } from '../utils/routing';
import {
  BlogType,
  BlogsTypeWithId,
} from '../../../src/features/blogs/api/models/output.blog.models/blog.models';
import { ErrorsMessages } from '../../../src/infra/utils/error-handler';
import { BlogViewModelType } from '../../../src/features/blogs/api/models/output.blog.models/blog.view.model-type';
import {
  CreatePostModel,
  InputPostModelByBlogId,
} from '../../../src/features/posts/api/models/input.posts.models/create.post.model';
import { PostViewModel } from '../../../src/features/posts/api/models/post.view.models/PostViewModel';
import { LikeStatusType, likesStatus } from '../../../src/domain/likes.types';

export class BlogsTestManager {
  constructor(protected readonly app: INestApplication) {}
  private application = this.app.getHttpServer();

  createInputData(field?: any): InputBlogModel {
    if (!field) {
      return {
        name: '',
        description: '',
        websiteUrl: '',
      };
    } else {
      return {
        name: field.name || 'Marcus Aurelius',
        description: field.description || 'Stoic philosopher',
        websiteUrl:
          field.websiteUrl || 'https://en.wikipedia.org/wiki/Stoicism',
      };
    }
  }

  createPostInputData(field?: any): Omit<CreatePostModel, 'blogId'> {
    if (!field) {
      return {
        title: '',
        content: '',
        shortDescription: '',
      };
    } else {
      return {
        title: field.title || 'About stoic quotes',
        content: field.content || 'https://en.wikipedia.org',
        shortDescription: field.shortDescription || 'Stoic philosophers',
      };
    }
  }

  checkBlogsBeforeTests = async () =>
    await request(this.application)
      .get(RouterPaths.blogs)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });

  async createBlog(
    inputData: InputBlogModel,
    expectedStatus: number = HttpStatus.CREATED,
  ): Promise<BlogsTypeWithId> {
    const res = await request(this.application)
      .post(RouterPaths.blogs)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(inputData)
      .expect(expectedStatus);

    return res.body;
  }
  async createPost(
    inputData: InputPostModelByBlogId,
    blog: BlogViewModelType,
    expectedStatus: number = HttpStatus.CREATED,
  ): Promise<PostViewModel> {
    const response = await request(this.application)
      .post(`${RouterPaths.blogs}/${blog.id}/posts`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(inputData)
      .expect(expectedStatus);

    if (response.status === HttpStatus.CREATED) {
      expect(response.body).toEqual({
        id: expect.any(String),
        title: inputData.title,
        shortDescription: inputData.shortDescription,
        content: inputData.content,
        blogId: blog.id,
        blogName: blog.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: likesStatus.None,
          newestLikes: expect.any(Array),
        },
      } as PostViewModel);
    }
    const post = response.body;

    return post;
  }

  async updateBlog(
    inputData: InputBlogModel,
    blogId: string,
    expectStatus: number = HttpStatus.NO_CONTENT,
  ) {
    const res = await request(this.application)
      .put(`${RouterPaths.blogs}/${blogId}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(inputData)
      .expect(expectStatus);

    return { result: res.body };
  }

  checkBlogData(
    responceModel:
      | BlogType
      | BlogsTypeWithId
      | PostViewModel
      | { errorsMessages: ErrorsMessages[] },
    expectedResult:
      | BlogType
      | BlogsTypeWithId
      | { errorsMessages: ErrorsMessages[] }
      | string,
  ) {
    expect(responceModel).toEqual(expectedResult);
  }

  async getBlogById(blogId: string, expectedStatus: number = HttpStatus.OK) {
    const response = await request(this.application)
      .get(`${RouterPaths.blogs}/${blogId}`)
      .expect(expectedStatus);

    return { blog: response.body };
  }

  async getPostsByBlogId(
    blogId: string,
    token: string | null,
    status: LikeStatusType,
    expectStatus: number = HttpStatus.OK,
  ) {
    const { body } = await request(this.application)
      .get(`${RouterPaths.blogs}/${blogId}/posts`)
      .auth(token || 'any', { type: 'bearer' })
      .expect(expectStatus);

    const postViewModel: PostViewModel = body.items;

    expect(postViewModel).toEqual([
      {
        id: expect.any(String),
        title: expect.any(String),
        shortDescription: expect.any(String),
        content: expect.any(String),
        blogId: expect.any(String),
        blogName: expect.any(String),
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: expect.any(Number),
          dislikesCount: expect.any(Number),
          myStatus: status,
          newestLikes: expect.any(Array),
        },
      } as PostViewModel,
    ]);
  }

  async checkStatusOptionId(
    blogId?: string,
    expectedStatus: number = HttpStatus.OK,
  ) {
    if (blogId) {
      const getById = await request(this.application)
        .get(`${RouterPaths.blogs}/${blogId}`)
        .expect(expectedStatus);
      return { blog: getById.body.items };
    } else {
      const check = await request(this.application)
        .get(`${RouterPaths.blogs}`)
        .expect(expectedStatus);
      return { blogs: check.body.items };
    }
  }

  async expectLength(expectLength: number) {
    const { body } = await request(this.application).get(
      `${RouterPaths.blogs}`,
    );

    expect(body.items).toHaveLength(expectLength);
  }

  async deleteBlog(blogId: string) {
    const beforeDelete = await request(this.application).get(
      `${RouterPaths.blogs}/${blogId}`,
    );

    const blog = beforeDelete.body;

    expect(blog).toBeDefined();

    await request(this.application)
      .delete(`${RouterPaths.blogs}/${blog.id}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HttpStatus.NO_CONTENT);

    const afterDelete = await request(this.application)
      .get(`${RouterPaths.blogs}/${blog.id}`)
      .expect(HttpStatus.NOT_FOUND);
  }
}

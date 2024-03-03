import { HttpStatus, INestApplication } from '@nestjs/common';
import { InputBlogModel } from '../../../src/features/blogs/api/models/input.blog.models/create.blog.model';
import request from 'supertest';
import { PathMappings, RouterPaths } from '../utils/routing';
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
import { PostViewModelType } from '../../../src/features/posts/api/models/post.view.models/post-view-model.type';
import { LikeStatusType, likesStatus } from '../../../src/domain/likes.types';
import { number } from 'joi';

export class BlogsTestManager {
  constructor(
    protected readonly app: INestApplication,
    protected path: PathMappings,
  ) {}
  private application = this.app.getHttpServer();
  private routing = RouterPaths[this.path];

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

  checkBlogsBeforeTests = async (
    accessToken: string,
    expectedCount?: number,
  ) => {
    const response = await request(this.application)
      .get(this.routing)
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    const expectedResponse = {
      pagesCount: expect.any(Number),
      page: 1,
      pageSize: 10,
      totalCount: expectedCount ? expectedCount : 1,
      items: expectedCount ? expect.any(Array) : [],
    };

    expect(response.body).toEqual(expectedResponse);
  };

  async createBlog(
    inputData: InputBlogModel,
    expectedStatus: number = HttpStatus.CREATED,
  ): Promise<BlogsTypeWithId> {
    const res = await request(this.application)
      .post(this.routing)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(inputData)
      .expect(expectedStatus);

    return res.body;
  }

  async createSABlog(
    inputData: InputBlogModel,
    accessToken: string,
    expectedStatus: number = HttpStatus.CREATED,
  ): Promise<BlogsTypeWithId> {
    const res = await request(this.application)
      .post(this.routing)
      .auth(accessToken, { type: 'bearer' })
      .send(inputData)
      .expect(expectedStatus);

    return res.body;
  }
  async createPost(
    inputData: InputPostModelByBlogId,
    blog: BlogViewModelType,
    expectedStatus: number = HttpStatus.CREATED,
  ): Promise<PostViewModelType> {
    const response = await request(this.application)
      .post(`${this.routing}/${blog.id}/posts`)
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
      } as PostViewModelType);
    }
    const post = response.body;

    return post;
  }

  async createSAPost(
    inputData: InputPostModelByBlogId,
    blog: BlogViewModelType,
    accessToken: string,
    expectedStatus: number = HttpStatus.CREATED,
  ): Promise<PostViewModelType> {
    const response = await request(this.application)
      .post(`${this.routing}/${blog.id}/posts`)
      .auth(accessToken || 'any', { type: 'bearer' })
      .send(inputData)
      .expect(expectedStatus);

    if (response.status === HttpStatus.CREATED) {
      const expectResponseModel = {
        id: expect.any(String),
        title: inputData.title,
        shortDescription: inputData.shortDescription,
        content: inputData.content,
        blogId: blog ? blog.id : expect.any(String),
        blogName: blog ? blog.name : expect.any(String),
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: likesStatus.None,
          newestLikes: expect.any(Array),
        },
      } as PostViewModelType;
      
      expect(response.body).toEqual(expectResponseModel);
    }
    const post = response.body;

    return post;
  }

  async updateBlog(
    inputData: InputBlogModel,
    blogId: string,
    accessToken: string | null = null,
    expectStatus: number = HttpStatus.NO_CONTENT,
  ) {
    if (!accessToken) {
      return request(this.application)
        .put(`${this.routing}/${blogId}`)
        .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
        .send(inputData)
        .expect(expectStatus);
    }

    return request(this.application)
      .put(`${this.routing}/${blogId}`)
      .auth(accessToken, { type: 'bearer' })
      .send(inputData)
      .expect(expectStatus);
  }

  checkBlogModel(
    responseModel:
      | BlogType
      | BlogsTypeWithId
      | PostViewModelType
      | { errorsMessages: ErrorsMessages[] }
      | any,
    expectedResult:
      | BlogType
      | BlogsTypeWithId
      | { errorsMessages: ErrorsMessages[] }
      | any
      | string,
  ) {
    expect(responseModel).toEqual(expectedResult);
  }

  checkBlogData(responseData: any, expectedResult: any) {
    expect(responseData).toEqual(expectedResult);
  }

  async getBlogById(blogId: string, expectedStatus: number = HttpStatus.OK) {
    const response = await request(this.application)
      .get(`${this.routing}/${blogId}`)
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
      .get(`${this.routing}/${blogId}/posts`)
      .auth(token || 'any', { type: 'bearer' })
      .expect(expectStatus);

    const postViewModel: PostViewModelType = body.items;

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
      } as PostViewModelType,
    ]);
  }

  async checkStatusOptionId(
    blogId?: string,
    accessToken?: string,
    expectedStatus: number = HttpStatus.OK,
  ) {
    if (blogId && !accessToken) {
      const getById = await request(this.application)
        .get(`${this.routing}/${blogId}`)
        .expect(expectedStatus);
      return { blog: getById.body };
    } else if (accessToken) {
      const getById = await request(this.application)
        .get(`${this.routing}/${blogId}`)
        .auth(accessToken, { type: 'bearer' })
        .expect(expectedStatus);
      return { blog: getById.body };
    } else {
      const check = await request(this.application)
        .get(`${this.routing}`)
        .expect(expectedStatus);
      return { blogs: check.body.items };
    }
  }

  async expectLength(expectLength: number, accessToken?: string) {
    const { body } = await request(this.application)
      .get(`${this.routing}`)
      .auth(accessToken || '', { type: 'bearer' });

    expect(body.items).toHaveLength(expectLength);
  }

  async deleteBlog(blogId: string, accessToken?: string) {
    const beforeDelete = await request(this.application).get(
      `${this.routing}/${blogId}`,
    );

    const blog = beforeDelete.body;

    expect(blog).toBeDefined();

    await request(this.application)
      .delete(`${this.routing}/${blog.id}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HttpStatus.NO_CONTENT);

    const afterDelete = await request(this.application)
      .get(`${this.routing}/${blog.id}`)
      .expect(HttpStatus.NOT_FOUND);
  }

  async deleteSABlog(
    blogId: string,
    accessToken: string,
    expectedStatus: number = HttpStatus.NO_CONTENT,
  ) {
    const beforeDelete = await request(this.application)
      .get(`${this.routing}/${blogId}`)
      .auth(accessToken, { type: 'bearer' });

    const blog = beforeDelete.body;

    expect(blog).toBeDefined();

    const res = await request(this.application)
      .delete(`${this.routing}/${blog.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(expectedStatus);

    const afterDelete = await request(this.application)
      .get(`${this.routing}/${blog.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(
        res.status === HttpStatus.NO_CONTENT
          ? HttpStatus.NOT_FOUND
          : blog.statusCode !== 404
          ? HttpStatus.OK
          : HttpStatus.NOT_FOUND,
      );
  }
}

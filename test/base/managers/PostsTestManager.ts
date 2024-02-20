import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CreatePostModel } from '../../../src/features/posts/api/models/input.posts.models/create.post.model';
import { RouterPaths } from '../utils/routing';
import { PostViewModelType } from '../../../src/features/posts/api/models/post.view.models/post-view-model.type';
import { ErrorsMessages } from '../../../src/infra/utils/error-handler';
import { LikeStatusType, likesStatus } from '../../../src/domain/likes.types';

export class PostsTestManager {
  constructor(protected readonly app: INestApplication) {}
  private application = this.app.getHttpServer();

  createInputData(field?: CreatePostModel | any): CreatePostModel {
    if (!field) {
      return {
        title: '',
        content: '',
        shortDescription: '',
        blogId: '',
      };
    } else {
      return {
        title: field.title || 'About stoic quotes ',
        content: field.content || 'https://en.wikipedia.org',
        shortDescription: field.shortDescription || 'Stoic philosophers',
        blogId: field.blogId || '',
      };
    }
  }

  checkPostsBeforeTests = async () =>
    await request(this.application)
      .get(RouterPaths.posts)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.CREATED, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });

  async createPost(
    inputData: CreatePostModel,
    expectedStatus: number = HttpStatus.CREATED,
  ): Promise<PostViewModelType> {
    const res = await request(this.application)
      .post(RouterPaths.posts)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(inputData)
      .expect(expectedStatus);

    return res.body;
  }

  async updatePost(
    inputData: CreatePostModel,
    postId: string,
    expectStatus: number = HttpStatus.NO_CONTENT,
  ) {
    return await request(this.application)
      .put(`${RouterPaths.posts}/${postId}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(inputData)
      .expect(expectStatus);
  }

  async getPosts() {
    await request(this.application).get('/posts').expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  }

  async getPostById(
    postId: string,
    token?: string | null,
    status: LikeStatusType = likesStatus.None,
    expectStatus: number = HttpStatus.OK,
  ) {
    const response = await request(this.application)
      .get(`${RouterPaths.posts}/${postId}`)
      .auth(token || 'any', { type: 'bearer' })
      .expect(expectStatus);

    const post: PostViewModelType = response.body;

    expect(post.extendedLikesInfo.myStatus).toBe(status);

    return post;
  }

  checkPostData(
    responseModel:
      | PostViewModelType
      | { errorsMessages: ErrorsMessages[] }
      | string,
    expectedResult:
      | PostViewModelType
      | { errorsMessages: ErrorsMessages[] }
      | string,
  ) {
    expect(responseModel).toEqual(expectedResult);
  }

  async checkLength(totalCount: number) {
    const { body } = await request(this.application).get(
      `${RouterPaths.posts}`,
    );

    expect(body.totalCount).toBe(totalCount);
  }

  async deletePost(postId: number) {
    const beforeDelete = await request(this.application).get(
      `${RouterPaths.posts}/${postId}`,
    );

    expect(beforeDelete.body).toBeDefined();

    await request(this.application)
      .delete(`${RouterPaths.posts}/${postId}`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(HttpStatus.NO_CONTENT);

    const afterDelete = await request(this.application)
      .get(`${RouterPaths.posts}/${postId}`)
      .expect(HttpStatus.NOT_FOUND);
  }
}

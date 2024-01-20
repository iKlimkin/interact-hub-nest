import { HttpStatus, INestApplication } from '@nestjs/common';
import { InputBlogModel } from '../../../src/features/blogs/api/models/input.blog.models/create.blog.model';
import request from 'supertest';
import { RouterPaths } from '../utils/routing';
import {
  BlogType,
  BlogsTypeWithId,
} from '../../../src/features/blogs/api/models/output.blog.models/blog.models';
import { ErrorsMessages } from '../../../src/infra/utils/errorHandler';

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
  async updateBlog (
    inputData: InputBlogModel,
    blogId: string,
    expectStatus: number = HttpStatus.NO_CONTENT
  ) {
    const res = await request(this.application)
      .put(`${RouterPaths.blogs}/${blogId}`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send(inputData)
      .expect(expectStatus)

    return { result: res.body };
  }

  checkBlogData(
    responceModel:
      | BlogType
      | BlogsTypeWithId
      | { errorsMessages: ErrorsMessages[] },
    expectedResult:
      | BlogType
      | BlogsTypeWithId
      | { errorsMessages: ErrorsMessages[] }
      | string,
  ) {
    expect(responceModel).toEqual(expectedResult);
  }

  async getBlogById (blogId: string, expectedStatus: number = HttpStatus.OK) {
    const response = await request(this.application)
      .get(`${RouterPaths.blogs}/${blogId}`)
      .expect(expectedStatus);

    return { blog: response.body }
  }

  async checkStatusOptionId(
    blogId?: string,
    expectedStatus: number = HttpStatus.OK,
  ) {
    if (blogId) {
      const getById = await request(this.application)
        .get(`${RouterPaths.blogs}/${blogId}`)
        .expect(expectedStatus);
    } else {
      const check = await request(this.application)
        .get(`${RouterPaths.blogs}`)
        .expect(expectedStatus);
    }
  }

  async expectLength(expectLength: number) {
    const { body } = await request(this.application)
      .get(`${RouterPaths.blogs}`)

    expect(body.items).toHaveLength(expectLength);
  }
}

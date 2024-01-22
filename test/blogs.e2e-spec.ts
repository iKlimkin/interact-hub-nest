import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { applyAppSettings } from '../src/settings/apply-app.settings';
import { BlogsTestManager } from './base/managers/BlogsTestManager';
import { BasicAuthorization } from './base/managers/BasicAuthManager';
import {
  blogEqualTo,
  blogValidationErrors,
} from './base/rest-models-helpers/blog-models';
import { RouterPaths } from './base/utils/routing';

describe('BlogsController (e2e)', () => {
  let app: INestApplication;
  let blogTestManager: BlogsTestManager;
  let basicAuthManager: BasicAuthorization;

  const dropDataBase = async () =>
    await request(app.getHttpServer()).delete(`${RouterPaths.test}`);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // .overrideProvider(EmailService)
      // .useClass(EmailMockService)
      .compile();

    app = moduleFixture.createNestApplication();

    applyAppSettings(app);

    await app.init();

    blogTestManager = new BlogsTestManager(app);
    basicAuthManager = new BasicAuthorization(app);

    await dropDataBase();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('createBlog', () => {
    afterAll(async () => {
      await dropDataBase();
    });

    it('/blogs (GET)', async () => {
      // checkStatus();
      await request(app.getHttpServer()).get('/blogs').expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it("/blogs (post) - shouldn't create blog without auth", async () => {
      const inputData = blogTestManager.createInputData({});

      await basicAuthManager.testPostAuthorization(
        'blogs',
        HttpStatus.UNAUTHORIZED,
      );

      expect.setState({ correctInputData: inputData });
    });

    it("/blogs (post) - shouldn't create blog with empty body ", async () => {
      const inputData = blogTestManager.createInputData();

      const newBlog = await blogTestManager.createBlog(
        inputData,
        HttpStatus.BAD_REQUEST,
      );

      blogTestManager.checkBlogData(newBlog, blogValidationErrors);
    });

    it('/blogs (post) - should create and return new blog', async () => {
      const { correctInputData } = expect.getState();

      const newBlog = await blogTestManager.createBlog(correctInputData);

      blogTestManager.checkBlogData(newBlog, blogEqualTo);
      const exptectLength = 1;

      await blogTestManager.checkStatusOptionId(newBlog.id);
      await blogTestManager.expectLength(exptectLength);
    });
  });

  describe('testing update blog (PUT)', () => {
    it("/blogs (put) - shouldn't update blog without auth", async () => {
      const { correctInputData } = expect.getState();

      const blog = await blogTestManager.createBlog(correctInputData);

      await blogTestManager.checkStatusOptionId(blog.id);

      await basicAuthManager.testPutAuthorization(
        'blogs',
        blog.id,
        HttpStatus.UNAUTHORIZED,
      );
      expect.setState({ blog });
    });

    it("/blogs (put) - shouldn't update the blog with incorrect input data", async () => {
      const { blog } = expect.getState();

      const invalidInputData = blogTestManager.createInputData();

      const { result } = await blogTestManager.updateBlog(
        invalidInputData,
        blog.id,
        HttpStatus.BAD_REQUEST,
      );
      blogTestManager.checkBlogData(result, blogValidationErrors);

      const { blog: existingBlog } = await blogTestManager.getBlogById(blog.id);
      blogTestManager.checkBlogData(blog, existingBlog);
    });

    it('/blogs (put) - should update blog', async () => {
      const { blog } = expect.getState();

      const beforeUpdate = await blogTestManager.getBlogById(blog.id);
      blogTestManager.checkBlogData(beforeUpdate.blog.name, 'Marcus Aurelius')

      const createOtheValidInputData = blogTestManager.createInputData({ name: 'Zeno' })

      const reposone = await blogTestManager.updateBlog(
        createOtheValidInputData,
        blog.id,
      );

      const afterUpdate = await blogTestManager.getBlogById(blog.id, HttpStatus.TOO_MANY_REQUESTS); // why...
      // blogTestManager.checkBlogData(afterUpdate.blog.name, 'Zeno')
    });
  });
});

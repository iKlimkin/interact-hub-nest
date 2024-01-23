import { INestApplication, HttpStatus } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { applyAppSettings } from '../src/settings/apply-app.settings';
import { BasicAuthorization } from './base/managers/BasicAuthManager';
import { BlogsTestManager } from './base/managers/BlogsTestManager';
import { RouterPaths } from './base/utils/routing';
import { PostsTestManager } from './base/managers/PostsTestManager';
import { postConstants } from './base/rest-models-helpers/post-models';
import { likesStatus } from '../src/infra/likes.types';

describe('BlogsController (e2e)', () => {
  let app: INestApplication;
  let postTestManager: PostsTestManager;
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

    postTestManager = new PostsTestManager(app);
    blogTestManager = new BlogsTestManager(app);
    basicAuthManager = new BasicAuthorization(app);

    await dropDataBase();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('createPost', () => {
    beforeAll(async () => {
      const inputData = blogTestManager.createInputData({});

      const blog = await blogTestManager.createBlog(inputData);

      expect.setState({ blog });
    });

    // afterAll(async () => {
    //   await dropDataBase();
    // });

    it('/posts (GET)', async () => {
      await postTestManager.getPosts();
    });

    it("/posts (POST) - shouldn't create post with empty body ", async () => {
      const inputData = postTestManager.createInputData();

      const post = await postTestManager.createPost(
        inputData,
        HttpStatus.BAD_REQUEST,
      );

      postTestManager.checkPostData(post, postConstants.postValidationErrors);
    });

    it('/posts (POST) - should not create post without correct blogId in body', async () => {
      const { blog } = expect.getState();

      const inputData = postTestManager.createInputData({
        blogId: `${blog.id}/1`,
      });

      const post = await postTestManager.createPost(
        inputData,
        HttpStatus.BAD_REQUEST,
      );
      const error = PostsTestManager.createErrorsMessageTest(['blogId']);

      postTestManager.checkPostData(post, error);
    });

    it('/posts (POST) - should not create post without auth', async () => {
      const { blog } = expect.getState();

      const inputData = postTestManager.createInputData({
        blogId: `${blog.id}`,
      });

      basicAuthManager.testPutAuthorization(
        'posts',
        blog.id,
        HttpStatus.UNAUTHORIZED,
      );

      expect.setState({ correctInputData: inputData });
    });
    it('/posts (POST) - should create and return new post', async () => {
      const { correctInputData } = expect.getState();

      const post = await postTestManager.createPost(correctInputData);

      postTestManager.checkPostData(post, postConstants.postEqualTo);

      const receivedPost = await postTestManager.getPostById(post.id);

      expect.setState({ post });
    });
  });

  describe('updatePost', () => {
    it('/posts (GET) - check post existence', async () => {
      const expectTotalCount = 1;
      await postTestManager.checkLength(expectTotalCount);
    });

    it("/posts (PUT) - shouldn't update the post with incorrect input data", async () => {
      const { blog } = expect.getState();
      const inputData = postTestManager.createInputData();

      const result = await postTestManager.updatePost(
        inputData,
        blog.id,
        HttpStatus.BAD_REQUEST,
      );

      postTestManager.checkPostData(
        result.body,
        postConstants.postValidationErrors,
      );
    });
    it('should update post', async () => {
      const { post, blog } = expect.getState();
      const newInputData = postTestManager.createInputData({
        title: 'About science',
        blogId: blog.id,
      });

      const updatedPost = await postTestManager.updatePost(
        newInputData,
        post.id,
      );

      const receivedPostAfterUpdate = await postTestManager.getPostById(
        post.id,
      );

      const checkTitleAfterUpdate = postTestManager.checkPostData(
        receivedPostAfterUpdate.title,
        newInputData.title,
      );
    });
  });
});

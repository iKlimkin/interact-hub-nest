import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { applyAppSettings } from '../src/settings/apply-app.settings';
import { aDescribe } from './base/aDescribe';
import { AuthManager } from './base/managers/AuthManager';
import { BasicAuthorization } from './base/managers/BasicAuthManager';
import { BlogsTestManager } from './base/managers/BlogsTestManager';
import { FeedbacksTestManager } from './base/managers/FeedbacksTestManager';
import { PostsTestManager } from './base/managers/PostsTestManager';
import { SAManager } from './base/managers/SAManager';
import {
  feedbacksConstants,
} from './base/rest-models-helpers/feedbacks.constants';
import { postConstants } from './base/rest-models-helpers/post-models';
import { dropDataBase } from './base/utils/dataBase-clean-up';
import { skipSettings } from './base/utils/tests-settings';
import { createErrorsMessages } from './base/utils/make-errors-messages';
import { userConstants } from './base/rest-models-helpers/users.constants';

aDescribe(skipSettings.for('posts'))('PostsController (e2e)', () => {
  let app: INestApplication;
  let postTestManager: PostsTestManager;
  let blogTestManager: BlogsTestManager;
  let basicAuthManager: BasicAuthorization;
  let authManager: AuthManager;
  let saManager: SAManager;
  let feedbacksTestManager: FeedbacksTestManager;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    applyAppSettings(app);

    await app.init();

    postTestManager = new PostsTestManager(app);
    blogTestManager = new BlogsTestManager(app);
    basicAuthManager = new BasicAuthorization(app);
    authManager = new AuthManager(app);
    saManager = new SAManager(app);
    feedbacksTestManager = new FeedbacksTestManager(app);

    await dropDataBase(app);
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

    it('/posts (GET)', async () => {
      await postTestManager.getPosts();
    });

    it("/posts (POST) - shouldn't create post with empty body ", async () => {
      const inputData = postTestManager.createInputData();

      const post = await postTestManager.createPost(
        inputData,
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(['blogId']);

      postTestManager.checkPostData(post, error);
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
      const error = createErrorsMessages(['blogId']);

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
      const { post } = expect.getState();
      const invalidInputData = postTestManager.createInputData();

      const result = await postTestManager.updatePost(
        invalidInputData,
        post.id,
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(['blogId']);

      postTestManager.checkPostData(result.body, error);
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

  describe('deletePost', () => {
    it("/posts (DELETE) - shouldn't remove post without auth", async () => {
      const { post } = expect.getState();

      await basicAuthManager.testDeleteAuthorization('posts', post.id);
    });

    it('/posts (DELETE) - should delete post', async () => {
      const { post } = expect.getState();
      await postTestManager.deletePost(post.id);
    });
  });

  describe('createComment', () => {
    beforeAll(async () => {
      const { blog } = expect.getState();
      const userInputData = saManager.createInputData({});
      const { user: user1 } = await saManager.createUser(userInputData);
      const result1 = await authManager.login(userInputData);

      const userAnotherData = saManager.createInputData({
        login: 'login',
        email: 'email@test.test',
      });
      const { user: user2 } = await saManager.createUser(userAnotherData);
      const result2 = await authManager.login(userAnotherData);

      const inputPostData = postTestManager.createInputData({
        blogId: blog.id,
      });
      const post = await postTestManager.createPost(inputPostData);

      expect.setState({
        post,
        user1,
        user2,
        accessToken1: result1.accessToken,
        accessToken2: result2.accessToken,
      });
    });

    it("/posts/:postId/comments (POST) - shouldn't create comment with invalid token, expect UNAUTHORIZED", async () => {
      const { post, user1 } = expect.getState();

      const invalidToken = userConstants.invalidData.anyData;
      await feedbacksTestManager.createComment(
        { user: user1, token: invalidToken, post },
        feedbacksConstants.createdContent[0],
        HttpStatus.UNAUTHORIZED,
      );
    });

    it("/posts/:postId/comments (POST) - shouldn't create comment with invalid postId, expect NOT_FOUND", async () => {
      const { post, accessToken1, user1 } = expect.getState();

      const invalidPost = { ...post, id: post.id.slice(-3) };

      await feedbacksTestManager.createComment(
        { user: user1, token: accessToken1, post: invalidPost },
        feedbacksConstants.createdContent[0],
        HttpStatus.NOT_FOUND,
      );
    });

    it("/posts/:postId/comments (POST) - shouldn't create comment with invalid body message (content), expect BAD_REQUEST", async () => {
      const { post, accessToken1, user1 } = expect.getState();

      const content = '';

      await feedbacksTestManager.createComment(
        { user: user1, token: accessToken1, post },
        content,
        HttpStatus.BAD_REQUEST,
      );
    });

    it("/posts/:postId/comments (POST) - shouldn't create comment with invalid body message (content), expect BAD_REQUEST", async () => {
      const { post, accessToken1, user1 } = expect.getState();
    });

    it('/posts/:postId/comments (POST) - should create one comment, expect CREATED', async () => {
      const { post, accessToken2, user2 } = expect.getState();

      await feedbacksTestManager.createComment(
        { user: user2, token: accessToken2, post },
        feedbacksConstants.createdContent[0],
      );
    });

    it('/posts/:postId/comments (POST) - should create 5 comments, expect CREATED', async () => {
      const { post, accessToken1, user1 } = expect.getState();

      for (let i = 0; i < 5; i++) {
        let content = feedbacksConstants.createdContent[i];
        await feedbacksTestManager.createComment(
          { user: user1, token: accessToken1, post },
          content,
        );
      }
    });

    it('/posts/:postId/comments (GET) - should receive 5 comments for current post, expect CREATED', async () => {
      const { post, accessToken1, user1 } = expect.getState();
    });
  });
});

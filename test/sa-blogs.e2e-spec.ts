import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { applyAppSettings } from '../src/settings/apply-app.settings';
import { aDescribe } from './base/aDescribe';
import { BasicAuthorization } from './base/managers/BasicAuthManager';
import { dropDataBase } from './base/utils/dataBase-clean-up';
import { skipSettings } from './base/utils/tests-settings';
import {
  blogEqualTo,
  blogValidationErrors,
} from './base/rest-models-helpers/blog-models';
import { DataSource } from 'typeorm';
import { AuthManager } from './base/managers/AuthManager';
import { FeedbacksTestManager } from './base/managers/FeedbacksTestManager';
import { PostsTestManager } from './base/managers/PostsTestManager';
import { SATestManager } from './base/managers/SATestManager';
import { UsersTestManager } from './base/managers/UsersTestManager';
import { initSettings } from './base/utils/init-settings';
import { BlogsTestManager } from './base/managers/BlogsTestManager';
import { constants } from './base/rest-models-helpers/blogs.constants';
import { createErrorsMessages } from './base/utils/make-errors-messages';
import { wait } from './base/utils/wait';
import { likesStatus } from '../src/domain/likes.types';

aDescribe(skipSettings.for('sa_blogs'))('SABlogsController (e2e)', () => {
  let app: INestApplication;
  let testingAppModule: TestingModule;
  let postTestManager: PostsTestManager;
  let blogTestManager: BlogsTestManager;
  let basicAuthManager: BasicAuthorization;
  let authManager: AuthManager;
  let saManager: SATestManager;
  let usersTestManager: UsersTestManager;
  let dataBase: DataSource;

  beforeAll(async () => {
    const result = await initSettings();

    testingAppModule = result.testingAppModule;
    usersTestManager = result.usersTestManager;

    dataBase = testingAppModule.get<DataSource>(DataSource);
    app = result.app;

    postTestManager = new PostsTestManager(app);
    blogTestManager = new BlogsTestManager(app, 'sa_blogs');
    basicAuthManager = new BasicAuthorization(app);
    authManager = new AuthManager(app);
    saManager = new SATestManager(app);

    await dropDataBase(app);
  });

  afterAll(async () => {
    await app.close();
  });
  beforeEach(async () => {
    const inputData1 = usersTestManager.createInputData({
      login: 'log1',
      email: 'email1@em.ru1',
    });
    const inputData2 = usersTestManager.createInputData({
      login: 'log2',
      email: 'email2@em.ru2',
    });

    const createBlogData = blogTestManager.createInputData({});

    const sa = await usersTestManager.createSA(inputData1);
    const sa2 = await usersTestManager.createSA(inputData2);

    const { accessToken, refreshToken } = await usersTestManager.authLogin(
      inputData1,
    );

    const { accessToken: accessToken2, refreshToken: refreshToken2 } =
      await usersTestManager.authLogin(inputData2);

    const blog = await blogTestManager.createSABlog(
      createBlogData,
      accessToken,
    );

    const createBlogData2 = blogTestManager.createInputData({
      name: 'August',
    });

    const blog2 = await blogTestManager.createSABlog(
      createBlogData2,
      accessToken2,
    );

    expect.setState({
      accessToken,
      accessToken2,
      refreshToken,
      correctInputBlogData: createBlogData,
      blog,
      blog2,
    });
  });

  describe('testing create blog', () => {
    afterAll(async () => {
      await dropDataBase(app);
    });

    it('/sa/blogs (GET)', async () => {
      const { accessToken } = expect.getState();
      const expectBlogsCount = 2;
      await blogTestManager.checkBlogsBeforeTests(
        accessToken,
        expectBlogsCount,
      );
    });

    it("/sa/blogs (post) - shouldn't create blog without auth", async () => {
      await basicAuthManager.testPostAuthorization('blogs');
    });

    it("/sa/blogs (POST) - shouldn't create blog with empty body ", async () => {
      const { accessToken } = expect.getState();
      const inputData = blogTestManager.createInputData();

      const newBlog = await blogTestManager.createSABlog(
        inputData,
        accessToken,
        HttpStatus.BAD_REQUEST,
      );

      blogTestManager.checkBlogModel(newBlog, blogValidationErrors);
    });

    it("/sa/blogs (POST) - shouldn't create blog with incorrect blog name", async () => {
      const { accessToken } = expect.getState();

      const inputDataShortLen = blogTestManager.createInputData({
        name: constants.inputData.length02,
      });

      const res1 = await blogTestManager.createSABlog(
        inputDataShortLen,
        accessToken,
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(['name']);
      blogTestManager.checkBlogData(res1, error);

      const inputDataOverLenName = blogTestManager.createInputData({
        name: constants.inputData.length16,
      });

      const res2 = await blogTestManager.createSABlog(
        inputDataOverLenName,
        accessToken,
        HttpStatus.BAD_REQUEST,
      );

      const error2 = createErrorsMessages(['name']);
      blogTestManager.checkBlogData(res2, error2);
    });
    it("/sa/blogs (POST) - shouldn't create blog with incorrect blog description", async () => {
      const { accessToken } = expect.getState();

      const shortDescription = blogTestManager.createInputData({
        description: constants.inputData.length02,
      });

      const res1 = await blogTestManager.createSABlog(
        shortDescription,
        accessToken,
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(['description']);
      blogTestManager.checkBlogData(res1, error);

      const longDescription = blogTestManager.createInputData({
        description: constants.inputData.length501,
      });

      const res2 = await blogTestManager.createSABlog(
        longDescription,
        accessToken,
        HttpStatus.BAD_REQUEST,
      );

      const error2 = createErrorsMessages(['description']);
      blogTestManager.checkBlogData(res2, error2);
    });
    it("/sa/blogs (POST) - shouldn't create blog with incorrect website url", async () => {
      const { accessToken } = expect.getState();

      const shortWebsiteUrl = blogTestManager.createInputData({
        websiteUrl: constants.inputData.length02,
      });

      const res1 = await blogTestManager.createSABlog(
        shortWebsiteUrl,
        accessToken,
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(['websiteUrl']);
      blogTestManager.checkBlogData(res1, error);

      const longWebsiteUrl = blogTestManager.createInputData({
        websiteUrl: constants.inputData.length101,
      });

      const res2 = await blogTestManager.createSABlog(
        longWebsiteUrl,
        accessToken,
        HttpStatus.BAD_REQUEST,
      );

      const error2 = createErrorsMessages(['websiteUrl']);
      blogTestManager.checkBlogData(res2, error2);

      const doesNotMatchUrl = blogTestManager.createInputData({
        websiteUrl: 'websiteUrl',
      });

      const res3 = await blogTestManager.createSABlog(
        doesNotMatchUrl,
        accessToken,
        HttpStatus.BAD_REQUEST,
      );

      const error3 = createErrorsMessages(['websiteUrl']);
      blogTestManager.checkBlogData(res3, error3);
    });
    it('/sa/blogs (post) - should create and return new blogs', async () => {
      await dataBase.query(`DELETE FROM blogs`);

      const { correctInputBlogData, accessToken, accessToken2 } =
        expect.getState();

      const blog = await blogTestManager.createSABlog(
        correctInputBlogData,
        accessToken,
      );

      const createBlogData = blogTestManager.createInputData({
        name: 'August',
      });

      const blog2 = await blogTestManager.createSABlog(
        createBlogData,
        accessToken2,
      );

      blogTestManager.checkBlogModel(blog, blogEqualTo);
      blogTestManager.checkBlogData(blog.isMembership, true);

      await blogTestManager.checkStatusOptionId(blog.id, accessToken);

      const expectLength = 2;
      await blogTestManager.expectLength(expectLength, accessToken);
    });
  });

  describe('testing update blog', () => {
    it("/sa/blogs (put) - shouldn't update blog without auth", async () => {
      const { accessToken, blog, blog2 } = expect.getState();

      await blogTestManager.checkStatusOptionId(blog.id, accessToken);

      await basicAuthManager.testPutAuthorization(
        'blogs',
        blog.id,
        HttpStatus.UNAUTHORIZED,
      );
    });

    it("/sa/blogs (put) - shouldn't update blog incorrect blog id, 404", async () => {
      const { accessToken, blog, correctInputBlogData } = expect.getState();

      const invalidBlogId = blog.id.slice(-5);

      await blogTestManager.updateBlog(
        correctInputBlogData,
        invalidBlogId,
        accessToken,
        HttpStatus.NOT_FOUND,
      );
    });

    it("/sa/blogs (put) - shouldn't update the blog with incorrect input data", async () => {
      const { accessToken, blog } = expect.getState();

      const invalidInputData = blogTestManager.createInputData();

      const result = await blogTestManager.updateBlog(
        invalidInputData,
        blog.id,
        accessToken,
        HttpStatus.BAD_REQUEST,
      );

      blogTestManager.checkBlogData(result.body, blogValidationErrors);

      const { blog: existingBlog } = await blogTestManager.checkStatusOptionId(
        blog.id,
        accessToken,
      );

      blogTestManager.checkBlogData(blog, existingBlog);
    });

    it("/sa/blogs (put) - shouldn't update the blog by foreign user, 403", async () => {
      const { accessToken, blog, blog2, accessToken2, correctInputBlogData } =
        expect.getState();

      const attempt1 = await blogTestManager.updateBlog(
        correctInputBlogData,
        blog.id,
        accessToken2,
        HttpStatus.FORBIDDEN,
      );

      const { blog: existingBlog } = await blogTestManager.checkStatusOptionId(
        blog.id,
        accessToken,
      );

      blogTestManager.checkBlogData(blog, existingBlog);

      const attempt2 = await blogTestManager.updateBlog(
        correctInputBlogData,
        blog2.id,
        accessToken,
        HttpStatus.FORBIDDEN,
      );

      const { blog: existingBlog2 } = await blogTestManager.checkStatusOptionId(
        blog2.id,
        accessToken,
      );

      blogTestManager.checkBlogData(blog2, existingBlog2);
    });

    it('/sa/blogs (put) - should update blog', async () => {
      const { blog, accessToken } = expect.getState();

      const beforeUpdate = await blogTestManager.checkStatusOptionId(
        blog.id,
        accessToken,
      );
      blogTestManager.checkBlogData(beforeUpdate.blog.name, 'Marcus Aurelius');

      const createOtherValidInputData = blogTestManager.createInputData({
        name: 'Zeno',
      });

      await blogTestManager.updateBlog(
        createOtherValidInputData,
        blog.id,
        accessToken,
      );

      const afterUpdate = await blogTestManager.checkStatusOptionId(
        blog.id,
        accessToken,
      );

      blogTestManager.checkBlogData(afterUpdate.blog.name, 'Zeno');
    });
  });

  describe('testing delete blog', () => {
    it('/blogs/:blogId - should not remove blog without auth, 401', async () => {
      const { blog } = expect.getState();

      await basicAuthManager.testDeleteAuthorization('sa_blogs', blog.id);
    });

    it("/blogs/:blogId - shouldn't remove blog with incorrect id, 404", async () => {
      const { blog, accessToken } = expect.getState();
      const invalidBlogId = blog.id.slice(-5);

      await blogTestManager.deleteSABlog(
        invalidBlogId,
        accessToken,
        HttpStatus.NOT_FOUND,
      );
    });

    it('/blogs/:blogId - should not remove blog by foreign user, 403', async () => {
      const { blog, accessToken2 } = expect.getState();
      await blogTestManager.deleteSABlog(
        blog.id,
        accessToken2,
        HttpStatus.FORBIDDEN,
      );
    });

    it('/blogs/:blogId - should remove blog and return not found, 204', async () => {
      const { blog, accessToken } = expect.getState();

      await blogTestManager.deleteSABlog(blog.id, accessToken);
    });
  });

  describe('testing create post', () => {
    it(`/blogs/:blogId/posts (POST) - shouldn't create post without auth, 401`, async () => {
      const { blog } = expect.getState();

      await basicAuthManager.testPostAuthorization(
        'sa_blogs',
        blog.id,
        'posts',
      );
    });

    it(`/blogs/:blogId/posts (POST) - shouldn't create post with invalid title, 400`, async () => {
      const { blog, accessToken } = expect.getState();

      const incorrectInputData = blogTestManager.createPostInputData({
        title: constants.inputData.length02,
      });

      const result = await blogTestManager.createSAPost(
        incorrectInputData,
        blog,
        accessToken,
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(['title']);

      blogTestManager.checkBlogData(result, error);

      const incorrectInputData2 = blogTestManager.createPostInputData({
        title: constants.inputData.length31,
      });

      const result2 = await blogTestManager.createSAPost(
        incorrectInputData2,
        blog,
        accessToken,
        HttpStatus.BAD_REQUEST,
      );

      const error2 = createErrorsMessages(['title']);

      blogTestManager.checkBlogData(result2, error2);
    });

    it(`/blogs/:blogId/posts (POST) - shouldn't create post with invalid description, 400`, async () => {
      const { blog, accessToken } = expect.getState();

      const incorrectInputData = blogTestManager.createPostInputData({
        shortDescription: constants.inputData.length02,
      });

      const result = await blogTestManager.createSAPost(
        incorrectInputData,
        blog,
        accessToken,
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(['shortDescription']);

      blogTestManager.checkBlogData(result, error);

      const incorrectInputData2 = blogTestManager.createPostInputData({
        shortDescription: constants.inputData.length101,
      });

      const result2 = await blogTestManager.createSAPost(
        incorrectInputData2,
        blog,
        accessToken,
        HttpStatus.BAD_REQUEST,
      );

      const error2 = createErrorsMessages(['shortDescription']);

      blogTestManager.checkBlogData(result2, error2);
    });

    it(`/blogs/:blogId/posts (POST) - shouldn't create post with invalid content, 400`, async () => {
      const { blog, accessToken } = expect.getState();

      const incorrectInputData = blogTestManager.createPostInputData({
        content: constants.inputData.length02,
      });

      const result = await blogTestManager.createSAPost(
        incorrectInputData,
        blog,
        accessToken,
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(['content']);

      blogTestManager.checkBlogData(result, error);

      const incorrectInputData2 = blogTestManager.createPostInputData({
        content: constants.inputData.length1001,
      });

      const result2 = await blogTestManager.createSAPost(
        incorrectInputData2,
        blog,
        accessToken,
        HttpStatus.BAD_REQUEST,
      );

      const error2 = createErrorsMessages(['content']);

      blogTestManager.checkBlogData(result2, error2);
    });

    it(`/blogs/:blogId/posts (POST) - shouldn't create post with all incorrect fields, testing error's messages, 400`, async () => {
      const { blog, accessToken } = expect.getState();

      const incorrectInputData = blogTestManager.createPostInputData();

      const result = await blogTestManager.createSAPost(
        incorrectInputData,
        blog,
        accessToken,
        HttpStatus.BAD_REQUEST,
      );

      const errors = createErrorsMessages([
        'title',
        'shortDescription',
        'content',
      ]);

      blogTestManager.checkBlogData(result, errors);
    });

    it(`/blogs/:blogId/posts (POST) - shouldn't create post for blog by foreign user, 403`, async () => {
      const { blog, accessToken2 } = expect.getState();

      const inputCreatePostData = blogTestManager.createPostInputData({});

      await blogTestManager.createSAPost(
        inputCreatePostData,
        blog,
        accessToken2,
        HttpStatus.FORBIDDEN,
      );

      expect.setState({ inputCreatePostData });
    });

    it(`/blogs/:blogId/posts (POST) - Try creating a post with an id of a blog that does not exist in test data, and assert that it fails or results in an error since the blog cannot be found, 404`, async () => {
      const { blog, accessToken, inputCreatePostData } = expect.getState();

      const invalidBlog = { ...blog, id: blog.id.slice(-5) };

      await blogTestManager.createSAPost(
        inputCreatePostData,
        invalidBlog,
        accessToken,
        HttpStatus.NOT_FOUND,
      );

      expect.setState({ inputCreatePostData });
    });

    it(`/blogs/:blogId/posts (POST) - should create post for existing blog`, async () => {
      const { blog, inputCreatePostData, accessToken } = expect.getState();
      console.log({blog, inputCreatePostData});
      
      const post = await blogTestManager.createSAPost(inputCreatePostData, blog, accessToken);

      expect.setState({ post })
    });

    it(`/blogs/:blogId/posts (GET) - should return one post`, async () => {
      const { blog, accessToken } = expect.getState();
      const myStatus = likesStatus.None;

      await blogTestManager.getPostsByBlogId(
        blog.id,
        accessToken,
        myStatus,
      );
    });
  });
  describe.skip('testing update post', () => {
    it(`/blogs/:blogId/posts (GET) - should return one post`, async () => {
      const { blog } = expect.getState();
      const myStatusWithoutToken = likesStatus.None;

      await blogTestManager.getPostsByBlogId(
        blog.id,
        null,
        myStatusWithoutToken,
      );
    });
  });
  describe('testing delete post', () => {});
});

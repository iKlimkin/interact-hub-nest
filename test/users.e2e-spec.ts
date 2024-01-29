import { HttpStatus, INestApplication } from '@nestjs/common';
import { EmailManager } from '../src/infra/application/managers/email-manager';
import { UsersTestManager } from './base/managers/UsersTestManager';
import { EmailManagerMock } from './base/mock/email.manager.mock';
import { userValidator } from './base/rest-models-helpers/user-models';
import { dropDataBase } from './base/utils/dataBase-clean-up';
import { initSettings } from './base/utils/init-settings';
import { createErrorsMessages } from './base/utils/make-errors-messages';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder.overrideProvider(EmailManager).useClass(EmailManagerMock),
    );

    usersTestManager = result.usersTestManager;
    app = result.app;
  });

  afterAll(async () => {
    await app.close();
  });

  // afterEach(async () => {
  //   await dropDataBase(app);
  // });

  describe('login', () => {
    afterAll(async () => {
      await dropDataBase(app);
    });

    beforeAll(async () => {
      const inputData = usersTestManager.createInputData({});
      const user = await usersTestManager.createSA(inputData);
      
      expect.setState({ user });
    });
    it(`/auth/login (POST) - shouldn't pass login with does'nt exist user's info, expect 401`, async () => {
      const newLogin = 'log';
      const inputData = usersTestManager.createInputData({ login: newLogin });

      const result = await usersTestManager.authLogin(
        inputData,
        !!newLogin,
        HttpStatus.UNAUTHORIZED,
      );
    });

    it(`/auth/login (POST) - shouldn't pass login with invalid registration login, expect 400`, async () => {
      const invalidLogin = 'lo';
      const inputData = usersTestManager.createInputData({
        login: invalidLogin,
      });

      const result = await usersTestManager.authLogin(
        inputData,
        !!invalidLogin,
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(['loginOrEmail']);
      usersTestManager.checkUserData(result, error);
    });

    it(`/auth/login (POST) - shouldn't pass login with invalid user's email, expect 400`, async () => {
      const invalidEmail = 'no';
      const inputData = usersTestManager.createInputData({
        email: invalidEmail,
      });

      const result = await usersTestManager.authLogin(
        inputData,
        null,
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(['loginOrEmail']);
      usersTestManager.checkUserData(result, error);
    });

    it(`/auth/login (POST) - shouldn't pass login with invalid user's password, expect 400`, async () => {
      const shortPassword = '12345';
      const inputData = usersTestManager.createInputData({
        password: shortPassword,
      });

      const result = await usersTestManager.authLogin(
        inputData,
        null,
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(['password']);
      usersTestManager.checkUserData(result, error);
    });

    it(`/auth/login (POST) - shouldn't pass login with invalid user's info, both invalid fields, expect 400 and errors format`, async () => {
      const inputData = usersTestManager.createInputData();
      
      const result = await usersTestManager.authLogin(
        inputData,
        null,
        HttpStatus.BAD_REQUEST,
      );
      const errors = createErrorsMessages(['loginOrEmail','password']);

      usersTestManager.checkUserData(
        result,
        errors
      );
    });

    it('/auth/login (POST) - should be logged in', async () => {
      const { user } = expect.getState();

      const token = await usersTestManager.authLogin(user);
      
      expect.setState({ accessToken: token.accessToken });
    });

    it("/auth/me (GET) - shouldn't get user's data, incorrectToken, 401", async () => {
      const invalidToken = '123';

      await usersTestManager.getProfile(
        null,
        invalidToken,
        HttpStatus.UNAUTHORIZED,
      );
    });

    it('/auth/me (GET) - should get user info', async () => {
      const { user, accessToken } = expect.getState();
      
      await usersTestManager.getProfile(user, accessToken);
    });
  });

  describe('refreshToken', () => {});
  describe('registration', () => {
    it('', async () => {
      const correctInputData = usersTestManager.createInputData({});

      const nonConfirmedUser =
        await usersTestManager.registration(correctInputData);
    });
  });
  describe('registration-email-resending', () => {});
  describe('registration-confirmation', () => {});
  describe('password-recovery', () => {});
  describe('new-password', () => {});
  describe('logout', () => {});
});

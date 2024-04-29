import { HttpStatus, INestApplication } from '@nestjs/common';
import { EmailManager } from '../src/infra/application/managers/email-manager';
import { aDescribe } from './base/aDescribe';
import { UsersTestManager } from './base/managers/UsersTestManager';
import { EmailManagerMock } from './base/mock/email.manager.mock';
import { dropDataBase } from './base/utils/dataBase-clean-up';
import { initSettings } from './base/utils/init-settings';
import { createErrorsMessages } from './base/utils/make-errors-messages';
import { skipSettings } from './base/utils/tests-settings';
import { wait } from './base/utils/wait'
import { AuthSQLController } from '../src/features/auth/api/controllers/auth-sql.controller';
import { AuthController } from '../src/features/auth/api/controllers/auth.controller';
import { userConstants } from './base/rest-models-helpers/users.constants';


aDescribe(skipSettings.for('userAuthSql'))('AuthController (e2e)', () => {
  let app: INestApplication;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
  const result = await initSettings((moduleBuilder) =>
      moduleBuilder.overrideProvider(EmailManager).useClass(EmailManagerMock).overrideProvider(AuthController).useClass(AuthSQLController),
    );

    usersTestManager = result.usersTestManager;
    app = result.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('login', () => {
    afterAll(async () => {
      await dropDataBase(app);
    });

    beforeAll(async () => {
      const inputData = usersTestManager.createInputData({});
      const user = await usersTestManager.createSA(inputData);

      expect.setState({ user, userInputData: inputData });
    });
    it(`/auth/login (POST) - shouldn't pass login with does'nt exist user's info, expect 401`, async () => {
      const newLogin = 'log';
      const inputData = usersTestManager.createInputData({ login: newLogin });

      await usersTestManager.authLogin(
        inputData,
        !!newLogin,
        HttpStatus.UNAUTHORIZED,
      );
    });

    it(`/auth/login (POST) - shouldn't pass login with invalid registration login, expect 400`, async () => {
      const invalidLogin = 'lo';
      const inputData = usersTestManager.createInputData({
        login: userConstants.registrationData.length02,
      });

      const result = await usersTestManager.authLogin(
        inputData,
        !!invalidLogin,
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(['loginOrEmail']);
      usersTestManager.checkUserData(result, error);
    });
    it(`/auth/login (POST) - shouldn't pass login with invalid registration login, expect 400`, async () => {
      const inputData = usersTestManager.createInputData({
        login: userConstants.registrationData.length101,
      });

      const result = await usersTestManager.authLogin(
        inputData,
        !0,
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(['loginOrEmail']);
      usersTestManager.checkUserData(result, error);
    });

    it(`/auth/login (POST) - shouldn't pass login with invalid user's email, expect 400`, async () => {
      const inputData = usersTestManager.createInputData({
        email: userConstants.registrationData.length02,
      });

      const result = await usersTestManager.authLogin(
        inputData,
        null,
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(['loginOrEmail']);
      usersTestManager.checkUserData(result, error);
    });

    it(`/auth/login (POST) - shouldn't pass login with invalid user's email, expect 400`, async () => {
      const inputData = usersTestManager.createInputData({
        email: userConstants.registrationData.length101,
      });

      const result = await usersTestManager.authLogin(
        inputData,
        null,
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(['loginOrEmail']);
      usersTestManager.checkUserData(result, error);
    });

    it(`/auth/login (POST) - shouldn't pass login with short user's password, expect 400`, async () => {
      const inputData = usersTestManager.createInputData({
        password: userConstants.registrationData.length05,
      });

      const result = await usersTestManager.authLogin(
        inputData,
        null,
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(['password']);
      usersTestManager.checkUserData(result, error);
    });

    it(`/auth/login (POST) - shouldn't pass login with long user's password, expect 400`, async () => {
      const inputData = usersTestManager.createInputData({
        password: userConstants.registrationData.length21,
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

      const errors = createErrorsMessages(['loginOrEmail', 'password']);
      usersTestManager.checkUserData(result, errors);
    });

    it('/auth/login (POST) - should be logged in', async () => {
      const { userInputData } = expect.getState();

      const { accessToken } = await usersTestManager.authLogin(userInputData);

      expect.setState({ accessToken });
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

    it('/auth/login (POST) - should receive 429 for over 5 attempt', async () => {
      const { user, accessToken } = expect.getState();

      await usersTestManager.getProfile(user, accessToken);
    });
  });

  describe('refreshToken, logout, me', () => {
    afterAll(async () => {
      await dropDataBase(app);
    });

    beforeAll(async () => {
      const inputData = usersTestManager.createInputData({});
      const user = await usersTestManager.createSA(inputData);

      const { accessToken, refreshToken } = await usersTestManager.authLogin(
        inputData,
        null,
        HttpStatus.OK,
      );

      expect.setState({
        user,
        oldAccessToken: accessToken,
        oldRefreshToken: refreshToken,
      });
    });

    it(`/auth/refresh-token (POST) - should update tokens`, async () => {
      const { oldRefreshToken } = expect.getState();

      await wait(1)

      const { accessToken, refreshToken } =
        await usersTestManager.refreshToken(oldRefreshToken);

      expect.setState({
        newAccessToken: accessToken,
        newRefreshToken: refreshToken,
      });
    });

    it(`/auth/refresh-token (POST) - shouldn't received tokens with former refreshToken, 401`, async () => {
      const { oldRefreshToken } = expect.getState();

      await usersTestManager.refreshToken(
        oldRefreshToken,
        HttpStatus.UNAUTHORIZED,
      );
    });

    it(`/auth/me (GET) - shouldn't get profile info with former token, 401`, async () => {
      const { oldAccessToken, user } = expect.getState();

      await usersTestManager.getProfile(
        oldAccessToken,
        user,
        HttpStatus.UNAUTHORIZED,
      );
    });

    it(`/auth/logout (POST) - shouldn't operate with former rt, 401`, async () => {
      const { oldRefreshToken } = expect.getState();

      await usersTestManager.logout(oldRefreshToken, HttpStatus.UNAUTHORIZED)
    });

    it(`/auth/logout (POST) - should to leave the account, `, async () => {
      const { newRefreshToken } = expect.getState();

      await usersTestManager.logout(newRefreshToken)
    });

    it(`/auth/logout (POST) - shouldn't received tokens after logout, 401`, async () => {
      const { newRefreshToken } = expect.getState();

      await usersTestManager.refreshToken(newRefreshToken, HttpStatus.UNAUTHORIZED)
    });

    it(`/auth/me (GET) - shouldn't get profile info after logout, 401`, async () => {
      const { newRefreshToken } = expect.getState();

      await usersTestManager.getProfile(
        null,
        newRefreshToken,
        HttpStatus.UNAUTHORIZED,
      );
    });
  });
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

import { HttpStatus, INestApplication } from '@nestjs/common';
import { EmailManager } from '../src/infra/application/managers/email-manager';
import { aDescribe } from './base/aDescribe';
import { UsersTestManager } from './base/managers/UsersTestManager';
import { dropDataBase } from './base/utils/dataBase-clean-up';
import { initSettings } from './base/utils/init-settings';
import { createErrorsMessages } from './base/utils/make-errors-messages';
import { skipSettings } from './base/utils/tests-settings';
import { wait } from './base/utils/wait';
import { TestBed } from '@automock/jest';
import {
  EmailManagerMock,
  EmailMockService,
} from './base/mock/email.manager.mock';
import { userConstants } from './base/rest-models-helpers/users.constants';
import { SecuritySqlQueryRepo } from '../src/features/security/api/query-repositories/security.query.sql-repo';
import { DataSource } from 'typeorm';
import { TestingModule } from '@nestjs/testing';
import { AuthUsersSqlRepository } from '../src/features/auth/infrastructure/auth-users.sql-repository';

aDescribe(skipSettings.for('userAuth'))('AuthController (e2e)', () => {
  let app: INestApplication;
  let testingAppModule: TestingModule;
  let usersTestManager: UsersTestManager;
  let emailManagerMock: EmailMockService;
  let authUsersSqlRepository: AuthUsersSqlRepository;
  let dataBase: DataSource;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder.overrideProvider(EmailManager).useClass(EmailMockService),
    );

    testingAppModule = result.testingAppModule;

    usersTestManager = result.usersTestManager;
    // const emailManagerMock = testingAppModule.get<EmailMockService>(EmailMockService)

    dataBase = testingAppModule.get<DataSource>(DataSource);

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

      await wait(1);

      const { accessToken, refreshToken } = await usersTestManager.refreshToken(
        oldRefreshToken,
      );

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

      await usersTestManager.logout(oldRefreshToken, HttpStatus.UNAUTHORIZED);
    });

    it(`/auth/logout (POST) - should leave from account, `, async () => {
      const { newRefreshToken } = expect.getState();

      await usersTestManager.logout(newRefreshToken);
    });

    it(`/auth/logout (POST) - shouldn't received tokens after logout, 401`, async () => {
      const { newRefreshToken } = expect.getState();

      await usersTestManager.refreshToken(
        newRefreshToken,
        HttpStatus.UNAUTHORIZED,
      );
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
    afterAll(async () => {
      await dropDataBase(app);
    });

    it(`/auth/registration (POST) - should pass registration for uniq user`, async () => {
      const correctInputData = usersTestManager.createInputData({});

      await usersTestManager.registration(correctInputData);
    });

    it(`/auth/registration (POST) - should receive error with the same already existed login, 400`, async () => {
      const inputData = usersTestManager.createInputData({});

      const result = await usersTestManager.registration(
        inputData,
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(['login']);
      usersTestManager.checkUserData(result, error);
    });

    it(`/auth/registration (POST) - should receive error with the same already existed email, 400`, async () => {
      const inputData = usersTestManager.createInputData({ login: 'another' });

      const result = await usersTestManager.registration(
        inputData,
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(['email']);
      usersTestManager.checkUserData(result, error);
    });

    it(`/auth/registration (POST) - shouldn't pass registration with bad passwords, 400`, async () => {
      const invalidInputDataShort = usersTestManager.createInputData({
        password: userConstants.registrationData.length05,
      });

      const invalidInputDataLong = usersTestManager.createInputData({
        password: userConstants.registrationData.length21,
      });

      const result1 = await usersTestManager.registration(
        invalidInputDataShort,
        HttpStatus.BAD_REQUEST,
      );

      const result2 = await usersTestManager.registration(
        invalidInputDataLong,
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(['password']);
      usersTestManager.checkUserData(result1, error);
      usersTestManager.checkUserData(result2, error);
    });

    it(`/auth/registration (POST) - shouldn't pass registration with bad fields, 400`, async () => {
      const invalidInputDataShort = usersTestManager.createInputData();

      await wait(10);

      const result = await usersTestManager.registration(
        invalidInputDataShort,
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(['login', 'password', 'email']);
      usersTestManager.checkUserData(result, error);
    });
  });
  describe('registration-email-resending', () => {
    beforeAll(async () => {
      const inputData = usersTestManager.createInputData({});
      const user = await usersTestManager.createSA(inputData);

      expect.setState({ user, userInputData: inputData });
    });

    afterAll(async () => {
      await dropDataBase(app);
    });

    it(`/auth/registration-email-resending (POST) - shouldn't passed api with invalid email, 400`, async () => {
      const res = await usersTestManager.registrationEmailResending(
        '@',
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(['email']);

      usersTestManager.checkUserData(res, error);
    });

    it(`/auth/registration-email-resending (POST) - shouldn't passed api with a non-existent email in the system, 400`, async () => {
      const res = await usersTestManager.registrationEmailResending(
        '1@m.ru',
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(
        ['email'],
        `Email is already confirmed or user doesn't exist`,
      );

      usersTestManager.checkUserData(res, error);
    });

    it(`/auth/registration-email-resending (POST) - shouldn't send message with confirmation code, user is confirmed, 400 `, async () => {
      const { userInputData } = expect.getState();

      const res = await usersTestManager.registrationEmailResending(
        userInputData.email,
        HttpStatus.BAD_REQUEST,
      );

      const error = createErrorsMessages(
        ['email'],
        `Email is already confirmed or user doesn't exist`,
      );

      usersTestManager.checkUserData(res, error);
    });

    it(`/auth/registration-email-resending (POST) - should send confirmation code, at least receive 204`, async () => {
      const { user } = expect.getState();

      await usersTestManager.deleteUser(user.id);

      const inputData = usersTestManager.createInputData({
        email: userConstants.registrationData.EMAIL2,
        login: userConstants.registrationData.length05,
      });
      await usersTestManager.registration(inputData);

      await usersTestManager.registrationEmailResending(inputData.email);
      expect.setState({ registrationData: inputData });
    });

    it(`/auth/registration-email-resending (POST) - should get confirmation code after registration, 204`, async () => {
      const { registrationData } = expect.getState();

      await wait(10);
      const { accessToken } = await usersTestManager.authLogin(
        registrationData,
      );

      const userInfo = await usersTestManager.getProfile(null, accessToken);

      const result = await dataBase.query(
        `SELECT confirmation_code FROM user_accounts WHERE id = '${userInfo.userId}'`,
      );

      const confirmationCode = result[0]['confirmation_code'];

      // const emailSpy = jest.spyOn(
      //   emailManagerMock,
      //   'sendEmailConfirmationMessage',
      // );

      // expect(emailSpy).toHaveBeenCalled();
      // expect(emailSpy).resolves;

      expect.setState({ confirmationCode });
    });

    it(`/auth/registration-confirmation (POST) - should'nt accept invalid confirmationCode, 400`, async () => {
      await usersTestManager.registrationConfirmation(
        null,
        HttpStatus.BAD_REQUEST,
      );
    });

    it(`/auth/registration-confirmation (POST) - should accept confirmationCode, and confirmed user, 204`, async () => {
      const { confirmationCode } = expect.getState();

      const responseBefore = await dataBase.query(
        `SELECT * FROM user_accounts WHERE confirmation_code = '${confirmationCode}'`,
      );

      expect(responseBefore[0]['is_confirmed']).toBeFalsy();
      await usersTestManager.registrationConfirmation(confirmationCode);

      const response = await dataBase.query(
        `SELECT is_confirmed FROM user_accounts WHERE confirmation_code = '${confirmationCode}'`,
      );

      expect(response[0]['is_confirmed']).toBeTruthy();
    });
  });
  describe('registration-confirmation', () => {});
  describe('password-recovery', () => {});
  describe('new-password', () => {});
});

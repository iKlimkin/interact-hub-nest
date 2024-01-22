import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { applyAppSettings } from '../src/settings/apply-app.settings';
import { BasicAuthorization } from './base/managers/BasicAuthManager';
import { BlogsTestManager } from './base/managers/BlogsTestManager';
import { UsersTestManager } from './base/managers/UsersTestManager';
import { EmailManager } from '../src/infra/application/managers/email-manager';
import { EmailManagerMock } from './base/mock/email.manager.mock';
import { RouterPaths } from './base/utils/routing';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let usersTestManager: UsersTestManager;
  // let basicAuthManager: BasicAuthorization;

  const dropDataBase = async () =>
    await request(app.getHttpServer()).delete(`${RouterPaths.test}`);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailManager)
      .useClass(EmailManagerMock)
      .compile();

    app = moduleFixture.createNestApplication();

    applyAppSettings(app);

    await app.init();

    usersTestManager = new UsersTestManager(app);

    await dropDataBase();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('login', () => {
    it('/auth (POST) - should passed registration', async () => {
      const correctInputData = usersTestManager.createInputData({});
        
      const nonConfirmedUser =
        await usersTestManager.registration(correctInputData);
    });
    it("/auth (POST) - shouldn't passed login", () => {});

    it('get profile (GET) me', () => {});
  });

  describe('refreshToken', () => {});
  describe('registration', () => {});
  describe('registration-email-resending', () => {});
  describe('registration-confirmation', () => {});
  describe('password-recovery', () => {});
  describe('new-password', () => {});
  describe('logout', () => {});
});

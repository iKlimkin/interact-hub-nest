import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { UsersTestManager } from './base/managers/UsersTestManager';
import { aDescribe } from './base/aDescribe';
import { expectLength } from './base/utils/expect-length.test-utils';
import { skipSettings } from './tests-settings';
import { AppModule } from '../src/app.module';
import { applyAppSettings } from '../src/settings/apply-app.settings';

const TEST_ADMIN_CREDENTIALS = {
  login: 'test',
  password: 'qwerty',
};

// Кастомная реализация пропуска тестов
aDescribe(skipSettings.for('appTests'))('AppController (e2e)', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // .overrideProvider(AdminUserService)
      // .useValue(UserServiceMockObject)
      .compile();

    app = moduleFixture.createNestApplication();

    // Применяем все настройки приложения (pipes, guards, filters, ...)
    applyAppSettings(app);

    await app.init();

    // Init userManager
    userTestManger = new UsersTestManager(app);

    // change env
    console.log(process.env.ENV);

    const loginResult = await UsersTestManager.login(
      app,
      TEST_ADMIN_CREDENTIALS.login,
      TEST_ADMIN_CREDENTIALS.password,
    );

    // Работа с состоянием
    expect.setState({
      adminAccessToken: loginResult.accessToken,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (POST)', async () => {
    // Work with state
    const { adminAccessToken } = expect.getState();

    const createModel = { name: 'qwerty' };

    const createResponse = await userTestManger.createUser(
      adminAccessToken,
      createModel,
    );

    userTestManger.expectCorrectModel(createModel, createResponse.body);

    const updateModel = { name: 'qwerty_777' };

    const updateResponse = await userTestManger.updateUser(
      adminAccessToken,
      updateModel,
    );

    userTestManger.expectCorrectModel(updateModel, updateResponse.body);
  });

  it('Auxiliary functions', async () => {
    const array = [1, 2, 3];

    expectLength(array, 3);

    // === false
    expect(false).toBeFalsy();
    // === true
    expect(true).toBeTruthy();
    // === null
    expect(null).toBeNull();
    // Свойство в объекте присутствует
    expect('Any string').toBeDefined();

    // Любая строка
    expect('Any string').toEqual(expect.any(String));
    // Любой массив
    expect([]).toEqual(expect.any(Array));

    // not null
    expect(100).not.toBeNull();
  });
});

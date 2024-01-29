import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { UsersTestManager } from './base/managers/UsersTestManager';
import { aDescribe } from './base/aDescribe';
import { expectLength } from './base/utils/expect-length.test-utils';
import { AppModule } from '../src/app.module';
import { applyAppSettings } from '../src/settings/apply-app.settings';
import { skipSettings } from './base/utils/tests-settings';

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (POST)', async () => {})
});

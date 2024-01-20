import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { applyAppSettings } from '../src/settings/apply-app.settings';


describe('BlogsController (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;

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

    httpServer = app.getHttpServer;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/blogs (GET)', () => {
    return request(app.getHttpServer)
      .get('/blogs')
      .expect(200)
      .expect('Content-Type', /json/);
  });
});

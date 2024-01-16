import { TestingModule, Test } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import request from 'supertest';



describe('BlogsController (e2e)', () => {
    let app;
    // const request = supertest.agent(app.getHttpServer());

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
  
      app = moduleFixture.createNestApplication();
      await app.init();
    });
  
    afterAll(async () => {
      await app.close();
    });
  
    it('/blogs (GET)', () => {
      return request(app.getHttpServer())
        .get('/blogs')
        .expect(200)
        .expect('Content-Type', /json/);
    });
  
    it('/blogs/:id (GET)', () => {
      const blogId = 'your-blog-id'; // Замените на существующий ID блога
      return request(app.getHttpServer())
        .get(`/blogs/${blogId}`)
        .expect(200)
        .expect('Content-Type', /json/);
    });
  
    it('/blogs/:id/posts (GET)', () => {
      const blogId = 'your-blog-id'; // Замените на существующий ID блога
      return request(app.getHttpServer())
        .get(`/blogs/${blogId}/posts`)
        .expect(200)
        .expect('Content-Type', /json/);
    });
  
    // Другие тесты для создания, обновления и удаления блогов и постов
  });
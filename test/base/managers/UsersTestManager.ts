import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthUserType } from '../../../src/features/auth/api/models/auth.output.models/auth.user.types';
import { RouterPaths } from '../utils/routing';

export class UsersTestManager {
  constructor(protected readonly app: INestApplication) {}
  private application = this.app.getHttpServer();


  createInputData(field?: AuthUserType | any): AuthUserType {
    if (!field) {
      return {
        login: "",
        password: "",
        email: "",
      };
    } else {
      return {
        login: field.login || "login",
        password: field.password || "password",
        email: field.email || "iklimkin50@gmail.com",
      };
    }
  }

  expectCorrectModel(createModel: any, responseModel: any) {
    expect(createModel.name).toBe(responseModel.name);
    expect(createModel.email).toBe(responseModel.email);
  }

  async createSA(adminAccessToken: string, createModel: any) {
    return request(this.application)
      .post('/api/users')
      .auth(adminAccessToken, {
        type: 'bearer',
      })
      .send(createModel)
      .expect(200);
  }

  async registration(inputData: AuthUserType,
    expectedStatus: number = HttpStatus.NO_CONTENT) {
    await request(this.application)
          .post(`${RouterPaths.auth}/registration`)
          .send(inputData)
          .expect(expectedStatus)
    }

  async updateUser(adminAccessToken: string, updateModel: any) {
    return request(this.application)
      .put('/api/users')
      .auth(adminAccessToken, {
        type: 'bearer',
      })
      .send(updateModel)
      .expect(204);
  }

  async authLogin(user?: AuthUserType | null, expectedStatus: number = HttpStatus.OK) {
    await request(this.application)
      .post(`${RouterPaths.auth}/login`)
      .send({ 
        loginOrEmail: user?.login || user?.email || 'invalid', 
        password: user?.password || 'qwerty'
      })
      .expect(expectedStatus)
  }
  

   
}


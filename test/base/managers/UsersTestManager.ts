import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthUserType } from '../../../src/features/auth/api/models/auth.output.models/auth.user.types';
import { RouterPaths } from '../utils/routing';
import { ErrorsMessages } from '../../../src/infra/utils/error-handler';
import { SAViewModel } from '../../../src/features/admin/api/models/userAdmin.view.models/userAdmin.view.model';

export class UsersTestManager {
  constructor(protected readonly app: INestApplication) {}
  private application = this.app.getHttpServer();

  createInputData(field?: AuthUserType | any): AuthUserType {
    if (!field) {
      return {
        login: ' ',
        password: ' ',
        email: ' ',
      };
    } else {
      return {
        login: field.login || 'login',
        password: field.password || 'password',
        email: field.email || 'iklimkin50@gmail.com',
      };
    }
  }

  expectCorrectModel(createModel: any, responseModel: any) {
    expect(createModel.name).toBe(responseModel.name);
    expect(createModel.email).toBe(responseModel.email);
  }

  async createSA(
    inputData: AuthUserType,
    expectedStatus: number = HttpStatus.CREATED,
  ): Promise<AuthUserType> {
    const result = await request(this.application)
      .post(RouterPaths.users)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(inputData)
      .expect(expectedStatus);

    return result.body;
  }

  async registration(
    inputData: AuthUserType,
    expectedStatus: number = HttpStatus.NO_CONTENT,
  ) {
    await request(this.application)
      .post(`${RouterPaths.auth}/registration`)
      .send(inputData)
      .expect(expectedStatus);
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

  async authLogin(
    user: AuthUserType,
    loginOrEmailOptions: boolean | null = false,
    expectedStatus: number = HttpStatus.OK,
    isResponse: boolean = false
  ): Promise<any> {
    const res = await request(this.application)
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: loginOrEmailOptions ? user.login : user.email,
        password: user.password || 'qwerty',
      })
      .expect(expectedStatus);

    if (isResponse) {
      return res
    }
    
    return res.body;
  }

  async refreshToken (refreshToken: string, expectedStatus: number = HttpStatus.CREATED) {
    const response = await request(this.application)
      .post(`${RouterPaths.auth}/refresh-token`)
      .set('Cookie', `${refreshToken}`)
      .expect(expectedStatus)

      if (expectedStatus === HttpStatus.CREATED) {
        expect(response.body).toEqual({accessToken: expect.any(String)})
        expect(response.headers['set-cookie']).toBeDefined()
      }
      
      return response
  }

  checkUserData(
    responseModel: any | { errorsMessages: ErrorsMessages[] },
    expectedResult: SAViewModel | { errorsMessages: ErrorsMessages[] },
  ) {
    expect(responseModel).toEqual(expectedResult);
  }

  async getProfile(
    user: AuthUserType | null,
    token: string,
    expectedStatus: number = HttpStatus.OK,
  ) {
    const res = await request(this.application)
      .get(`${RouterPaths.auth}/me`)
      .auth(token, { type: 'bearer' })
      .expect(expectedStatus);

    if (user)
      expect(res.body).toEqual({
        email: user.email,
        login: user.login,
        id: expect.any(String),
      });
  }

  static extractRefreshToken(response: any) {
    return response.headers['set-cookie'][0].split(';')[0]
  }
}

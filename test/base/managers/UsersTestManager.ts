import request from 'supertest';
import { AuthUserType } from '../../../src/features/auth/api/models/auth.output.models/auth.user.types';
import { RouterPaths } from '../utils/routing';
import { ErrorsMessages } from '../../../src/infra/utils/error-handler';
import { SAViewModel } from '../../../src/features/admin/api/models/userAdmin.view.models/userAdmin.view.model';
import { JwtTokens } from '../../../src/features/auth/api/models/jwt.types';
import { INestApplication, HttpStatus } from '@nestjs/common';

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
        email: field.email || 'kr4mboy@gmail.com',
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
    const response = await request(this.application)
      .post(`${RouterPaths.auth}/registration`)
      .send(inputData)
      .expect(expectedStatus);

    return response.body;
  }

  async registrationEmailResending(
    email: string,
    expectedStatus: number = HttpStatus.NO_CONTENT,
  ) {
    const response = await request(this.application)
      .post(`${RouterPaths.auth}/registration-email-resending`)
      .send({ email })
      .expect(expectedStatus);

      return response.body
  }

  async updateUser(adminAccessToken: string, updateModel: any) {
    return request(this.application)
      .put('/api/users')
      .auth(adminAccessToken, {
        type: 'bearer',
      })
      .send(updateModel)
      .expect(HttpStatus.NO_CONTENT);
  }

  async authLogin(
    user: AuthUserType,
    loginOrEmailOptions: boolean | null = false,
    expectedStatus: number = HttpStatus.OK,
  ): Promise<JwtTokens | any> {
    const res = await request(this.application)
      .post(`${RouterPaths.auth}/login`)
      .send({
        loginOrEmail: loginOrEmailOptions ? user.login : user.email,
        password: user.password || 'qwerty',
      })
      .expect(expectedStatus);

    if (res.status === HttpStatus.OK) {
      const token = res.body;
      const refreshToken = this.extractRefreshToken(res);
      return { refreshToken, accessToken: token.accessToken };
    }

    return res.body;
  }

  async refreshToken(
    refreshToken: string,
    expectedStatus: number = HttpStatus.CREATED,
  ): Promise<JwtTokens | any> {
    const response = await request(this.application)
      .post(`${RouterPaths.auth}/refresh-token`)
      .set('Cookie', `${refreshToken}`)
      .expect(expectedStatus);

    if (expectedStatus === HttpStatus.CREATED) {
      expect(response.body).toEqual({ accessToken: expect.any(String) });
      expect(response.headers['set-cookie']).toBeDefined();

      const { accessToken } = response.body;
      const rt = this.extractRefreshToken(response);

      return { accessToken, refreshToken: rt };
    }

    return response.body;
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

    if (user && expectedStatus === HttpStatus.OK)
      expect(res.body).toEqual({
        email: user.email,
        login: user.login,
        userId: expect.any(String),
      });
  }

  async logout(
    refreshToken: string,
    expectedStatus: number = HttpStatus.NO_CONTENT,
  ) {
    await request(this.application)
      .post(`${RouterPaths.auth}/logout`)
      .set('Cookie', `${refreshToken}`)
      .expect(expectedStatus);
  }

  private extractRefreshToken(response: any) {
    return response.headers['set-cookie'][0].split(';')[0];
  }
}

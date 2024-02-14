import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthUserType } from '../../../src/features/auth/api/models/auth.output.models/auth.user.types';
import { ErrorsMessages } from '../../../src/infra/utils/error-handler';
import { RouterPaths } from '../utils/routing';
import { SecurityViewDeviceModel } from '../../../src/features/security/api/models/security.view.models/security.view.types';
import { userConstants } from '../rest-models-helpers/users.constants';

type CheckDataParams = AuthUserType | { errorsMessages: ErrorsMessages[] };

export class SecurityTestManager {
  constructor(protected readonly app: INestApplication) {}
  private application = this.app.getHttpServer();

  async securityLogin(
    i: number = 0,
    auth?: AuthUserType,
    expectedStatus: number = HttpStatus.OK,
  ) {
    await request(this.application)
      .post(`${RouterPaths.auth}/login`)
      .set('user-agent', `device-${i + 1}`)
      .send({
        loginOrEmail: auth ? auth.email : userConstants.registrationData.EMAIL,
        password: auth ? auth.password : userConstants.registrationData.PASSWORD,
      })
      .expect(expectedStatus);
  }

  async getUserActiveSessions(
    refreshToken: string,
    expectedStatus: number = HttpStatus.OK,
  ) {
    const { body } = await request(this.application)
      .get(`${RouterPaths.security}/devices`)
      .set('Cookie', refreshToken)
      .expect(expectedStatus);

    expect(body).toBeDefined();

    return body as SecurityViewDeviceModel;
  }

  async deleteSpecificSession(
    refreshToken: string,
    deviceId: number,
    expectedStatus = HttpStatus.NO_CONTENT,
  ) {
    await request(this.application)
      .delete(`${RouterPaths.security}/devices/${deviceId}`)
      .set('Cookie', refreshToken)
      .expect(expectedStatus);
  }

  async deleteSessionsExceptCurrent(
    refreshToken: string,
    expectedStatus = HttpStatus.NO_CONTENT,
  ) {
    await request(this.application)
      .delete(`${RouterPaths.security}/devices`)
      .set('Cookie', refreshToken)
      .expect(expectedStatus);
  }

  async checkStatusApiLogs(expectedStatus: number = HttpStatus.OK) {
    const api = await request(this.application)
      .get(`${RouterPaths.security}/devices/requestLogs`)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(expectedStatus);

    expect(api.body).toHaveLength(0);
  }

  compareSessionsDate(firstData: number, lastData: number) {
    expect(lastData).toBeGreaterThan(firstData);
  }

  compareAfterDeleteSession(session: any) {
    expect(session).toBeUndefined();
  }

  checkData(responseModel: CheckDataParams, expectedResult: CheckDataParams) {
    expect(responseModel).toEqual(expectedResult);
  }
}

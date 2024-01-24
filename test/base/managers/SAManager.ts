import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthUserType } from '../../../src/features/auth/api/models/auth.output.models/auth.user.types';
import { RouterPaths } from '../utils/routing';
import { UserViewModel } from '../../../src/features/admin/api/models/userAdmin.view.models/userAdmin.view.model';

export class SAManager {
  constructor(protected readonly app: INestApplication) {}
  private application = this.app.getHttpServer();

  createInputData(field?: AuthUserType | any): AuthUserType {
    if (!field) {
      return {
        login: '',
        password: '',
        email: '',
      };
    } else {
      return {
        login: field.login || 'ykt91eU6FW',
        password: field.password || 'qwerty',
        email: field.email || 'qwert@yaol.com',
      };
    }
  }

  async createUser(
    inputData: AuthUserType,
    expectedStatus: number = HttpStatus.CREATED,
  ): Promise<{ user: UserViewModel }> {
    const response = await request(this.application)
      .post(RouterPaths.users)
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send(inputData)
      .expect(expectedStatus);

    const user = response.body;

    return { user };
  }
}

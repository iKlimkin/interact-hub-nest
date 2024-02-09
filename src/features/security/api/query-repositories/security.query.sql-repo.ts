import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  getSqlSessionViewModel
} from '../models/security.view.models/security.view.model';
import {
  SecurityViewDeviceModel,
  UserSQLSession,
} from '../models/security.view.models/security.view.types';

@Injectable()
export class SecuritySqlQueryRepo {
  constructor(private dataSource: DataSource) {}

  async getUserActiveSessions(
    userId: string,
  ): Promise<SecurityViewDeviceModel[] | null> {
    try {
      const findQuery = `
        SELECT *
        FROM user_sessions
        WHERE user_id = $1
      `;
      const result = await this.dataSource.query<UserSQLSession[]>(findQuery, [
        userId,
      ]);

      if (!result) return null;

      return result.map(getSqlSessionViewModel);
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate with find user sessions',
        error,
      );
    }
  }

  async getUserSession(
    deviceId: string,
  ): Promise<SecurityViewDeviceModel | null> {
    try {
      const findQuery = `
      SELECT *
      FROM user_sessions
      WHERE device_id = $1
      `;

      const result = await this.dataSource.query<UserSQLSession>(findQuery, [
        deviceId,
      ]);

      if (!result) return null;

      return getSqlSessionViewModel(result[0]);
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate with find user session',
        error,
      );
    }
  }
}

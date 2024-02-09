import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OutputId } from '../../../domain/likes.types';
import {
  UserSQLSession,
  UserSQLSessionDTO,
} from '../api/models/security.view.models/security.view.types';

@Injectable()
export class SecuritySqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async save(
    sessionDto: Readonly<UserSQLSessionDTO>,
  ): Promise<OutputId | null> {
    try {

      const query = `
      INSERT INTO "user_sessions"
      ("ip", "title", "user_id", "device_id",
      "refresh_token", "rt_issued_at", "rt_expiration_date")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING "id"
      `;

      const result = await this.dataSource.query<UserSQLSession>(
        query,
        Object.values(sessionDto),
      );

      return {
        id: result[0].id,
      };
    } catch (error) {
      console.error(`
      Database fails operate with create session ${error}`);
      return null;
    }
  }

  async updateIssuedToken(
    deviceId: string,
    issuedAt: string,
  ): Promise<boolean> {
    try {
      const updateQuery = `
        UPDATE user_sessions
        SET rt_issued_at = $1
        WHERE device_id = $2
      `;

      const result = await this.dataSource.query(updateQuery, [
        issuedAt,
        deviceId,
      ]);

      return result[1] > 0;
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate with update session',
        error,
      );
    }
  }

  async deleteSpecificSession(deviceId: string): Promise<boolean> {
    try {
      const deleteQuery = `
        DELETE FROM user_sessions
        WHERE device_id = $1
      `;

      const result = await this.dataSource.query(deleteQuery, [deviceId]);

      return result[1] > 0;
    } catch (error) {
      console.error(
        `Database fails operate with delete specific session ${error}`,
      );
      return false;
    }
  }

  async deleteOtherUserSessions(deviceId: string): Promise<boolean> {
    try {
      const deleteManyQuery = `
        DELETE FROM user_sessions
        WHERE device_id <> $1
      `;

      const result = await this.dataSource.query(deleteManyQuery, [deviceId]);

      return result[1] > 0;
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate with delete other sessions',
        error,
      );
    }
  }
}

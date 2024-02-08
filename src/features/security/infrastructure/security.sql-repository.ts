import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OutputId } from '../../../domain/likes.types';
import {
  Security,
  SecurityDocument,
  SecurityModelType,
} from '../domain/entities/security.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  UserSQLSession,
  UserSQLSessionDTO,
} from '../api/models/security.view.models/security.view.types';

@Injectable()
export class SecuritySQLRepository {
  constructor(
    @InjectModel(Security.name) private SecurityModel: SecurityModelType,
    @InjectDataSource() private dataSource: DataSource,
  ) {}
  async save(sessionDto: Readonly<UserSQLSessionDTO>): Promise<OutputId | null> {
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
      Database fails operate with create session ${error}`)
      return null
    }

  }

  async updateIssuedToken(
    deviceId: string,
    issuedAt: string,
  ): Promise<boolean> {
    try {
      const updatedSession = await this.SecurityModel.updateOne(
        { deviceId },
        { $set: { issuedAt } },
      );

      return updatedSession.modifiedCount === 1;
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate with update session',
        error,
      );
    }
  }

  async deleteSpecificSession(deviceId: string): Promise<boolean> {
    try {
      const session = await this.SecurityModel.deleteOne({ deviceId });

      return session.deletedCount === 1;
    } catch (error) {
      console.error(
        `Database fails operate with delete specific session ${error}`,
      );
      return false;
    }
  }

  async deleteOtherUserSessions(deviceId: string): Promise<boolean> {
    try {
      const userSessions = await this.SecurityModel.deleteMany({
        $nor: [{ deviceId }],
      });

      return userSessions.deletedCount === 1;
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate with delete other sessions',
        error,
      );
    }
  }
}

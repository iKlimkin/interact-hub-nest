import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SecurityViewDeviceModel } from '../models/security.view.models/security.view.types';
import {
  getSqlSessionViewModel,
  getTORSessionViewModel,
} from '../models/security.view.models/security.sql-view.models';
import { UserSqlSession } from '../models/security.view.models/security.sql-view.types';
import { UserSession } from '../../domain/entities/security.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SecurityTORQueryRepo {
  constructor(
    @InjectRepository(UserSession)
    private readonly userSessions: Repository<UserSession>,
  ) {}

  async getUserActiveSessions(
    userId: string,
  ): Promise<SecurityViewDeviceModel[] | null> {
    try {
      const sessions = await this.userSessions.find({
        where: {
          userAccount: { id: userId },
        },
      });
      
      if (!sessions) return null;

      return sessions.map(getTORSessionViewModel);
    } catch (error) {
      console.error(`Database fails operate with find user sessions ${error}`);
      return null;
    }
  }

  async getUserSession(
    deviceId: string,
  ): Promise<SecurityViewDeviceModel | null> {
    try {
      const sessions = await this.userSessions.find({
        where: {
          device_id: deviceId,
        },
      });

      if (!sessions) return null;

      return getTORSessionViewModel(sessions[0]);
    } catch (error) {
      console.error(`Database fails operate with find user session ${error}`);
      return null;
    }
  }
}

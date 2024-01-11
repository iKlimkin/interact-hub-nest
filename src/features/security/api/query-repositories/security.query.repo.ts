import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { getSecurityViewModel } from '../models/security.view.models/security.view.model';
import { SecurityViewDeviceModel } from '../models/security.view.models/security.view.types';
import {
  Security,
  SecurityModelType,
} from '../../domain/entities/security.schema';

@Injectable()
export class SecurityQueryRepo {
  constructor(
    @InjectModel(Security.name) private SecurityModel: SecurityModelType,
  ) {}

  async getUserActiveSessions(
    userId: string,
  ): Promise<SecurityViewDeviceModel[] | null> {
    try {
      const userSessions = await this.SecurityModel.find({ userId });

      if (!userSessions) return null;

      return userSessions.map(getSecurityViewModel);
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
      const findUserSesession = await this.SecurityModel.findOne({ deviceId });

      if (!findUserSesession) return null;

      return getSecurityViewModel(findUserSesession);
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate with find user session',
        error,
      );
    }
  }
}

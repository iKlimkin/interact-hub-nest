import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Security,
  SecurityDocument,
  SecurityModelType,
} from '../domain/entities/security.schema';
import { OutputId } from '../../../domain/likes.types';

@Injectable()
export class SecurityRepository {
  constructor(
    @InjectModel(Security.name) private SecurityModel: SecurityModelType,
  ) {}
  async addDeviceSession(
    sessionModel: Readonly<SecurityDocument>,
  ): Promise<OutputId> {
    try {
      const createdSession = await sessionModel.save();

      return {
        id: createdSession._id.toString(),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate with create session',
        error,
      );
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
      const userSession = await this.SecurityModel.findOneAndDelete({
        deviceId,
      });

      // const test = await this.SecurityModel.deleteOne({ _id: deviceId })

      return !!userSession;
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate with delete specific session',
        error,
      );
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

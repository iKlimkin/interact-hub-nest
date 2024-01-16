import { Injectable } from '@nestjs/common';
import { OutputId } from 'src/infra/likes.types';
import { InputSessionData } from '../api/models/security-input.models/create.session.type';
import {
  Security,
  SecurityModelType,
} from '../domain/entities/security.schema';
import { SecurityRepository } from '../infrastructure/security.repository';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SecurityService {
  constructor(
    @InjectModel(Security.name) private SecurityModel: SecurityModelType,
    private securityRepository: SecurityRepository,
  ) {}

  async createUserSession(inputData: InputSessionData): Promise<OutputId> {
    const sessionModel = this.SecurityModel.makeInstance(inputData);

    return await this.securityRepository.addDeviceSession(sessionModel);
  }

  async updateIssuedToken(
    deviceId: string,
    issuedAt: string,
  ): Promise<boolean> {
    const updatedSessionDate = await this.securityRepository.updateIssuedToken(
      deviceId,
      issuedAt,
    );
    return updatedSessionDate;
  }

  async deleteActiveSession(deviceId: string): Promise<boolean> {
    const deletedSession =
      await this.securityRepository.deleteSpecificSession(deviceId);
    return deletedSession;
  }

  async deleteOtherUserSessions(deviceId: string): Promise<boolean> {
    const deletedSessions =
      await this.securityRepository.deleteOtherUserSessions(deviceId);
    return deletedSessions;
  }
}

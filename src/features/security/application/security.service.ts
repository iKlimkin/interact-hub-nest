import { Injectable } from '@nestjs/common';
import session from 'express-session';
import { OutputId } from 'src/infra/likes.types';
import { InputSessionData } from '../api/models/security-input.models/create.session.type';
import { Security } from '../domain/entities/security.schema';
import { SecurityRepository } from '../infrastructure/security.repository';

@Injectable()
export class SecurityService {
  constructor(private securityRepository: SecurityRepository) {}

  async createUserSession(
    inputData: InputSessionData,
  ): Promise<OutputId | null> {
    const sessionDto = Security.makeInstance(inputData);

    // const session = new SessionDBType(
    //   inputData.ip,
    //   `Device type: ${inputData.deviceType}, Application: ${inputData.browser}`,
    //   inputData.userId,
    //   deviceId,
    //   inputData.refreshToken,
    //   new Date(iat! * 1000).toISOString(),
    //   new Date(exp! * 1000).toISOString()
    // );

    const createdSession =
      await this.securityRepository.addDeviceSession(sessionDto);

    return createdSession;
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

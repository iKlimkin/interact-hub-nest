import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { SecurityService } from '../../domain/security.service';
import { SecurityQueryRepo } from '../../infrastructure/security.query.repo';
import { SecurityInterface } from '../models/security-input.models/security.interface';

@Controller('security/devices')
export class SecurityController implements SecurityInterface {
  constructor(
    private securityQueryRepo: SecurityQueryRepo,
    private securityService: SecurityService,
  ) {}

  @Get()
  async getUserActiveSessions(@Res() res) {
    const { userId } = res.locals.userId;

    const securityData =
      await this.securityQueryRepo.getUserActiveSessions(userId);

    if (!securityData) {
      throw new UnauthorizedException('have no active sessions');
    }

    res.send(securityData);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateOtherUserSessions(@Res() res) {
    const { deviceId } = res.locals;

    return this.securityService.deleteOtherUserSessions(deviceId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateSpecificSession(@Param('id') deviceId: string, @Res() res) {
    const { userId } = res.locals;

    const theSession = await this.securityQueryRepo.getUserSession(deviceId);

    if (!theSession) {
      throw new NotFoundException('Session not found');
    }

    const sessions = await this.securityQueryRepo.getUserActiveSessions(userId);

    if (!sessions!.some((s) => s.deviceId === deviceId)) {
      throw new ForbiddenException('do not have permission');
    }

    await this.securityService.deleteActiveSession(deviceId);
  }

//   @Get('requestLogs')
//   @HttpCode(HttpStatus.NO_CONTENT)
//   async getRequestApiLogs() {
//     return apiRepository.getClientRequestsCollection();
//   }
}

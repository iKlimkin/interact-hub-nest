import {
  Controller,
  UseGuards,
  Get,
  UnauthorizedException,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiRequestCounterRepository } from '../../../../infra/repositories/api-request-counter.repository';
import { UserInfoType } from '../../../auth/api/controllers/auth.controller';
import { CurrentUserInfo } from '../../../auth/infrastructure/decorators/current-user-info.decorator';
import { RefreshTokenGuard } from '../../../auth/infrastructure/guards/refreshToken.guard';
import { SecurityService } from '../../application/security.service';
import { SecurityInterface } from '../models/security-input.models/security.interface';
import { SecurityViewDeviceModel } from '../models/security.view.models/security.view.types';
import { SecurityQueryRepo } from '../query-repositories/security.query.repo';

@Controller('security/devices')
@UseGuards(RefreshTokenGuard)
export class SecurityController implements SecurityInterface {
  constructor(
    private securityQueryRepo: SecurityQueryRepo,
    private securityService: SecurityService,
    private apiRequestCounterRepository: ApiRequestCounterRepository,
  ) {}

  @Get()
  async getUserActiveSessions(
    @CurrentUserInfo() userInfo: UserInfoType,
  ): Promise<SecurityViewDeviceModel[]> {
    const { userId } = userInfo;

    const securityData =
      await this.securityQueryRepo.getUserActiveSessions(userId);

    if (!securityData) {
      throw new UnauthorizedException('have no active sessions');
    }

    return securityData;
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateOtherUserSessions(@CurrentUserInfo() userInfo: UserInfoType) {
    await this.securityService.deleteOtherUserSessions(userInfo.deviceId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateSpecificSession(
    @Param('id') deviceId: string,
    @CurrentUserInfo() userInfo: UserInfoType,
  ) {
    const theSession = await this.securityQueryRepo.getUserSession(deviceId);

    if (!theSession) {
      throw new NotFoundException('Session not found');
    }

    const sessions = await this.securityQueryRepo.getUserActiveSessions(
      userInfo.userId,
    );

    if (!sessions!.some((s) => s.deviceId === deviceId)) {
      throw new ForbiddenException('do not have permission');
    }

    await this.securityService.deleteActiveSession(deviceId);
  }

  @Get('requestLogs')
  @HttpCode(HttpStatus.NO_CONTENT)
  async getRequestApiLogs() {
    return this.apiRequestCounterRepository.getClientRequestsCollection();
  }
}

import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiRequestCounterRepository } from '../../../infra/logging/infra/api-request-counter.repository';
import { ObjectIdPipe } from '../../../infra/pipes/valid-objectId.pipe';
import { UserInfoType } from '../../auth/api/models/user-models';
import { CurrentUserInfo } from '../../auth/infrastructure/decorators/current-user-info.decorator';
import { RefreshTokenGuard } from '../../auth/infrastructure/guards/refreshToken.guard';
import { DeleteActiveSessionCommand } from '../application/use-cases/commands/delete-active-session.command';
import { DeleteOtherUserSessionsCommand } from '../application/use-cases/commands/delete-other-user-sessions.command';
import { SecurityInterface } from './models/security-input.models/security.interface';
import { SecurityViewDeviceModel } from './models/security.view.models/security.view.types';
import { SecurityQueryRepo } from './query-repositories/security.query.repo';

@Controller('security/devices')
@UseGuards(RefreshTokenGuard)
export class SecurityController implements SecurityInterface {
  constructor(
    private securityQueryRepo: SecurityQueryRepo,
    private apiRequestCounterRepository: ApiRequestCounterRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getUserActiveSessions(
    @CurrentUserInfo() userInfo: UserInfoType,
  ): Promise<SecurityViewDeviceModel[]> {
    const { userId } = userInfo;

    const securityData = await this.securityQueryRepo.getUserActiveSessions(
      userId,
    );

    if (!securityData) {
      throw new UnauthorizedException('Have no active sessions');
    }

    return securityData;
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateOtherUserSessions(@CurrentUserInfo() userInfo: UserInfoType) {
    const command = new DeleteOtherUserSessionsCommand(userInfo.deviceId);
    await this.commandBus.execute(command);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateSpecificSession(
    @Param('id', ObjectIdPipe) deviceId: string,
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

    const command = new DeleteActiveSessionCommand(deviceId);

    await this.commandBus.execute(command);
  }

  @Get('requestLogs')
  @HttpCode(HttpStatus.NO_CONTENT)
  async getRequestApiLogs() {
    return this.apiRequestCounterRepository.getClientRequestsCollection();
  }
}

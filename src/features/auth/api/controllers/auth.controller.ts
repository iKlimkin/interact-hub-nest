import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../../../../infra/application/auth.service';
import { RateLimitInterceptor } from '../../../../infra/interceptors/rate-limit.interceptor.ts';
import { getDeviceInfo } from '../../../../infra/utils/deviceHandler';
import {
  ErrorType,
  makeErrorsMessages,
} from '../../../../infra/utils/errorHandler';
import { UsersQueryRepository } from '../../../admin/api/query-repositories/users.query.repo';
import { SecurityService } from '../../../security/application/security.service';
import { AuthUserService } from '../../application/auth-user.service';
import { GetClientInfo } from '../../infrastructure/decorators/client-ip.decorator';
import { CurrentUserInfo } from '../../infrastructure/decorators/current-user-info.decorator';
import { AccessTokenGuard } from '../../infrastructure/guards/accessToken.guard';
import { LocalAuthGuard } from '../../infrastructure/guards/local-auth.guard';
import { RefreshTokenGuard } from '../../infrastructure/guards/refreshToken.guard';
import { InputCredentialsModel } from '../models/auth-input.models.ts/input-credentials.model';
import { InputRecoveryEmailModel } from '../models/auth-input.models.ts/input-password-rec.type';
import { InputRecoveryPassModel } from '../models/auth-input.models.ts/input-recovery.model';
import { InputRegistrationCodeModel } from '../models/auth-input.models.ts/input-registration-code.model';
import { InputRegistrationModel } from '../models/auth-input.models.ts/input-registration.model';
import { AuthQueryRepository } from '../query-repositories/auth-query-repo';
import { Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../application/use-cases/create-user-use-case';

type ClientInfo = {
  ip: string;
  userAgentInfo: any;
};

export type UserInfoType = {
  userId: string;
  deviceId: string;
};

@Controller('auth')
export class AuthController {
  constructor(
    private authQueryRepository: AuthQueryRepository,
    private usersQueryRepo: UsersQueryRepository,
    private authUserService: AuthUserService,
    private securityService: SecurityService,
    private authService: AuthService,
    private commandBus: CommandBus
  ) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @CurrentUserInfo() userInfo: UserInfoType,
    @GetClientInfo() clientInfo: ClientInfo,
    @Res({ passthrough: true }) res: Response,
    @Body() body: InputCredentialsModel,
  ) {
    const { accessToken, refreshToken } = await this.authService.getTokens(
      userInfo.userId,
    );

    const userPayload = this.authService.getUserPayloadByToken(refreshToken);
    if (!userPayload) throw new Error();

    const { browser, deviceType } = getDeviceInfo(clientInfo.userAgentInfo);

    const createSessionData = {
      userPayload,
      browser,
      deviceType,
      ip: clientInfo.ip,
      userAgentInfo: clientInfo.userAgentInfo,
      userId: userInfo.userId,
      refreshToken,
    };

    await this.securityService.createUserSession(createSessionData);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

    return { accessToken };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  async refreshToken(
    @CurrentUserInfo() userInfo: UserInfoType,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userId, deviceId } = userInfo;

    const { accessToken, refreshToken } =
      await this.authService.updateUserTokens(userId, deviceId);

    const userInfoAfterRefresh =
      this.authService.getUserPayloadByToken(refreshToken);

    const issuedAt = new Date(userInfoAfterRefresh!.iat * 1000).toISOString();

    await this.securityService.updateIssuedToken(deviceId, issuedAt);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    res.send({ accessToken });
  }

  //@UseInterceptors(RateLimitInterceptor)
  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: InputRecoveryPassModel) {
    const { newPassword, recoveryCode } = body;

    const updatedPassword = await this.authUserService.updatePassword({
      newPassword,
      recoveryCode,
    });

    if (!updatedPassword) {
      throw new NotFoundException();
    }
  }

  //@UseInterceptors(RateLimitInterceptor)
  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() body: InputRecoveryEmailModel) {
    const { email } = body;

    const foundUserAccount = await this.authQueryRepository.findByLoginOrEmail({
      email,
    });

    if (!foundUserAccount) {
      const codeForNonExistentUser =
        await this.authUserService.createTemporaryUserAccount(email);
    }

    const recoveredPassword =
      await this.authUserService.passwordRecovery(email);
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(
    @Body() inputModel: InputRegistrationModel,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { login, email } = inputModel;

    const foundUser = await this.authQueryRepository.findByLoginOrEmail({
      login,
      email,
    });

    if (foundUser) {
      let errors: ErrorType;

      if (foundUser.accountData.email === email) {
        errors = makeErrorsMessages('email');
      }

      if (foundUser.accountData.login === login) {
        errors = makeErrorsMessages('login');
      }

      res.status(HttpStatus.BAD_REQUEST).send(errors!);
      return;
    }

    const newUser = await this.commandBus.execute(new CreateUserCommand(inputModel));
  }

  //@UseInterceptors(RateLimitInterceptor)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async registrationConfirmation(
    @Body() inputCode: InputRegistrationCodeModel,
    @Res({ passthrough: true }) res: Response,
  ) {
    const confirmedUser = await this.authUserService.confirmEmail(inputCode.code);

    if (!confirmedUser) {
      const errors = makeErrorsMessages('code');
      res.status(HttpStatus.BAD_REQUEST).send(errors);
    }
  }

  //@UseInterceptors(RateLimitInterceptor)
  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(
    @Body() inputModel: InputRecoveryEmailModel,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email } = inputModel;
    const confirmedUser = await this.authQueryRepository.findByLoginOrEmail({
      email,
    });

    if (!confirmedUser || confirmedUser.emailConfirmation.isConfirmed) {
      const errors = makeErrorsMessages('confirmation');
      res.status(HttpStatus.BAD_REQUEST).send(errors);
      return;
    }

    const updatedUserConfirmation =
      await this.authUserService.updateConfirmationCode(confirmedUser);
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getProfile(@CurrentUserInfo() userInfo: UserInfoType) {
    const user = await this.usersQueryRepo.getUserById(userInfo.userId);

    if (!user) {
      throw new NotFoundException();
    }

    const userViewModel = {
      email: user.email,
      login: user.login,
      id: userInfo.userId,
    };

    return userViewModel;
  }

  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUserInfo() userInfo: UserInfoType) {
    await this.securityService.deleteActiveSession(userInfo.deviceId);
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  AuthUserType,
  LoginCredentials,
} from '../models/auth.output.models/auth.user.types';
import { UsersQueryRepository } from 'src/features/admin/api/query-repositories/users.query.repo';
import { Response } from 'express';
import {
  InputEmail,
  InputRecoveryEmailModel,
  PasswordRecoveryType,
} from '../models/auth-input.models.ts/input-password-rec.type';
import { AuthQueryRepository } from '../query-repositories/auth-query-repo';
import { SecurityService } from 'src/features/security/application/security.service';
import { getDeviceInfo } from 'src/infra/utils/deviceHandler';
import { AuthUserService } from '../../application/auth-user.service';
import { LocalAuthGuard } from '../../infrastructure/guards/local-auth.guard';
import { UserAgent } from 'express-useragent';
import { AuthService } from 'src/infra/application/auth.service';
import { CurrentUserInfo } from '../../infrastructure/decorators/current-user-info.decorator';
import { RefreshTokenGuard } from '../../infrastructure/guards/refreshToken.guard';
import { GetClientInfo } from '../../infrastructure/decorators/client-ip.decorator';
import { InputRecoveryPassModel } from '../models/auth-input.models.ts/input-recovery-model';
import { InputCredentialsModel } from '../models/auth-input.models.ts/input-credentials-model';
import { AccessTokenGuard } from '../../infrastructure/guards/accessToken.guard';
import { RateLimitInterceptor } from 'src/infra/interceptors/rate-limit.interceptor.ts';

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
  ) {}

  @UseGuards(LocalAuthGuard)
  @UseInterceptors(RateLimitInterceptor)
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

    const { accessToken, refreshToken } = this.authService.updateUserTokens(
      userId,
      deviceId,
    );

    const userInfoAfterRefresh =
      this.authService.getUserPayloadByToken(refreshToken);

    const issuedAt = new Date(userInfoAfterRefresh!.iat * 1000).toISOString();

    await this.securityService.updateIssuedToken(deviceId, issuedAt);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    res.send({ accessToken });
  }

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

  // async registration(req: RequestWithBody<AuthUserType>, res: Response) {
  //   const { login, email, password } = req.body;

  //   const foundUser = await this.authQueryRepository.findByLoginOrEmail({
  //     login,
  //     email,
  //   });

  //   if (foundUser) {
  //     if (foundUser.accountData.email === email) {
  //       const errors = makeErrorsMessages('email');

  //       res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errors);
  //       return;
  //     }

  //     if (foundUser.accountData.login === login) {
  //       const errors = makeErrorsMessages('login');

  //       res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errors);
  //       return;
  //     }
  //   }

  //   const user = await this.AuthUserService.createUser({
  //     login,
  //     email,
  //     password,
  //   });

  //   if (!user.data) {
  //     const { status, errorsMessages } = handleAuthResult(user);
  //     res.status(status).send({ errorsMessages });
  //     return;
  //   }

  //   res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  // }

  // async registrationConfirmation(
  //   req: RequestWithBody<{ code: string }>,
  //   res: Response,
  // ) {
  //   const { code } = req.body;

  //   const confirmedUser = await this.AuthUserService.confirmEmail(code);

  //   if (!confirmedUser.data) {
  //     const errors = makeErrorsMessages('code');

  //     res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errors);
  //     return;
  //   }

  //   res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  // }

  // async registrationEmailResending(
  //   req: RequestWithBody<Pick<AuthUserType, 'email'>>,
  //   res: Response,
  // ) {
  //   const { email } = req.body;

  //   const confirmedUser = await this.authQueryRepository.findByLoginOrEmail({
  //     email,
  //   });

  //   if (!confirmedUser || confirmedUser.emailConfirmation.isConfirmed) {
  //     const errors = makeErrorsMessages('confirmation');

  //     res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errors);
  //     return;
  //   }

  //   const updatedUserConfirmation =
  //     await this.AuthUserService.updateConfirmationCode(confirmedUser);

  //   if (!updatedUserConfirmation.data) {
  //     const { status, errorsMessages } = handleAuthResult(
  //       updatedUserConfirmation,
  //     );
  //     res.status(status).send({ errorsMessages });
  //     return;
  //   }

  //   res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  // }

  @UseGuards(RefreshTokenGuard)
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

  // async logout(req: Request, res: Response) {
  //   const { deviceId } = res.locals;

  //   await this.securityService.deleteActiveSession(deviceId);

  //   res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  // }
}

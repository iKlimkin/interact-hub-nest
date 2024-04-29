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
import { CommandBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { OutputId } from '../../../../domain/likes.types';
import { CustomThrottlerGuard } from '../../../../infra/guards/custom-throttler.guard';
import { getDeviceInfo } from '../../../../infra/utils/device-handler';
import {
  ErrorType,
  makeErrorsMessages,
} from '../../../../infra/utils/error-handler';
import { InputSessionDataValidator } from '../../../security/api/models/security-input.models/create-session.model';
import { CreateSessionSQLCommand } from '../../../security/application/use-cases/commands/create-session.sql-command';
import { DeleteActiveSessionSqlCommand } from '../../../security/application/use-cases/commands/delete-active-session-sql.command';
import { UpdateIssuedTokenSqlCommand } from '../../../security/application/use-cases/commands/update-Issued-token-sql.command';
import { AuthService } from '../../application/auth.service';
import { ConfirmEmailSqlCommand } from '../../application/use-cases/commands/confirm-email-sql.command';
import { CreateTemporaryAccountSqlCommand } from '../../application/use-cases/commands/create-temp-account-sql.command';
import { CreateUserSQLCommand } from '../../application/use-cases/commands/create-user-sql.command';
import { PasswordRecoverySqlCommand } from '../../application/use-cases/commands/recovery-password-sql.command';
import { UpdateConfirmationCodeSqlCommand } from '../../application/use-cases/commands/update-confirmation-code-sql.command';
import { UpdatePasswordTemporaryAccountSqlCommand } from '../../application/use-cases/commands/update-password-temporary-account-sql.command';
import { UpdatePasswordSqlCommand } from '../../application/use-cases/commands/update-password.command';
import { GetClientInfo } from '../../infrastructure/decorators/client-ip.decorator';
import { CurrentUserInfo } from '../../infrastructure/decorators/current-user-info.decorator';
import { AccessTokenGuard } from '../../infrastructure/guards/accessToken.guard';
import { LocalAuthGuard } from '../../infrastructure/guards/local-auth.guard';
import { RefreshTokenGuard } from '../../infrastructure/guards/refreshToken.guard';
import { InputRecoveryEmailModel } from '../models/auth-input.models.ts/input-password-rec.type';
import { InputRecoveryPassModel } from '../models/auth-input.models.ts/input-recovery.model';
import { InputRegistrationCodeModel } from '../models/auth-input.models.ts/input-registration-code.model';
import { InputRegistrationModel } from '../models/auth-input.models.ts/input-registration.model';
import { UserProfileType } from '../models/auth.output.models/auth.output.models';
import { UserInfoType } from '../models/user-models';
import { AuthQuerySqlRepository } from '../query-repositories/auth-query.sql-repo';
import { RateLimitSqlInterceptor } from '../../../../infra/interceptors/rate-limit-sql.interceptor';
import { AuthQueryTORRepository } from '../query-repositories/auth-query.tor-repo';

type ClientInfo = {
  ip: string;
  userAgentInfo: any;
};

@Controller('auth')
export class AuthSQLController {
  constructor(
    private authQuerySqlRepository: AuthQuerySqlRepository,
    private authRepo: AuthQueryTORRepository,
    private authService: AuthService,
    private commandBus: CommandBus,
  ) {}

  // @UseInterceptors(RateLimitSqlInterceptor)
  @UseGuards(CustomThrottlerGuard, LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @CurrentUserInfo() userInfo: UserInfoType,
    @GetClientInfo() clientInfo: ClientInfo,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.getTokens(
      userInfo.userId,
    );

    const userPayload = this.authService.getUserPayloadByToken(refreshToken);

    if (!userPayload) throw new Error();

    const { browser, deviceType } = getDeviceInfo(clientInfo.userAgentInfo);

    const createSessionData: InputSessionDataValidator = {
      userPayload: userPayload,
      browser,
      deviceType,
      ip: clientInfo.ip,
      userAgentInfo: clientInfo.userAgentInfo,
      userId: userInfo.userId,
      refreshToken,
    };

    const command = new CreateSessionSQLCommand(createSessionData);

    await this.commandBus.execute<CreateSessionSQLCommand, OutputId>(command);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

    return { accessToken };
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
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

    const issuedAt = new Date(userInfoAfterRefresh!.iat * 1000);
    const expirationDate = new Date(userInfoAfterRefresh!.exp * 1000);

    const command = new UpdateIssuedTokenSqlCommand(
      deviceId,
      issuedAt,
      expirationDate,
    );

    await this.commandBus.execute<UpdateIssuedTokenSqlCommand, boolean>(
      command,
    );

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    return { accessToken };
  }

  @UseGuards(CustomThrottlerGuard)
  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: InputRecoveryPassModel) {
    const existingAccount = await this.authRepo.findUserAccountByRecoveryCode(
      body.recoveryCode,
    );

    if (existingAccount) {
      const command = new UpdatePasswordSqlCommand(body);

      return this.commandBus.execute<UpdatePasswordSqlCommand, boolean>(
        command,
      );
    }

    const command = new UpdatePasswordTemporaryAccountSqlCommand(body);

    return this.commandBus.execute(command);
  }

  @UseGuards(CustomThrottlerGuard)
  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() inputEmailModel: InputRecoveryEmailModel) {
    const userAccount = await this.authRepo.findByLoginOrEmail(inputEmailModel);

    if (!userAccount) {
      const command = new CreateTemporaryAccountSqlCommand(inputEmailModel);

      await this.commandBus.execute<CreateTemporaryAccountSqlCommand, OutputId>(
        command,
      );

      return;
    }

    const command = new PasswordRecoverySqlCommand(inputEmailModel);

    await this.commandBus.execute<PasswordRecoverySqlCommand, boolean>(command);
  }

  @Post('registration')
  @UseGuards(CustomThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(
    @Body() inputModel: InputRegistrationModel,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { login, email } = inputModel;

    const foundUser = await this.authRepo.findByLoginOrEmail({
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

    const command = new CreateUserSQLCommand(inputModel);

    await this.commandBus.execute(command);
  }

  @UseGuards(CustomThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async registrationConfirmation(
    @Body() inputCode: InputRegistrationCodeModel,
    @Res({ passthrough: true }) res: Response,
  ) {
    const command = new ConfirmEmailSqlCommand(inputCode);

    const confirmedUser = await this.commandBus.execute<
      ConfirmEmailSqlCommand,
      boolean
    >(command);

    if (!confirmedUser) {
      const errors = makeErrorsMessages('code');
      res.status(HttpStatus.BAD_REQUEST).send(errors);
    }
  }

  @UseGuards(CustomThrottlerGuard)
  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(
    @Body() inputModel: InputRecoveryEmailModel,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email } = inputModel;
    const userAccount = await this.authRepo.findByLoginOrEmail({
      email,
    });

    if (
      !userAccount ||
      userAccount.emailConfirmation.isConfirmed ||
      new Date(userAccount.emailConfirmation.expirationDate) < new Date()
    ) {
      const errors = makeErrorsMessages('confirmation');
      res.status(HttpStatus.BAD_REQUEST).send(errors);
      return;
    }

    const command = new UpdateConfirmationCodeSqlCommand(userAccount);

    await this.commandBus.execute(command);
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getProfile(
    @CurrentUserInfo() userInfo: UserInfoType,
  ): Promise<UserProfileType> {
    const user = await this.authRepo.getUserById(userInfo.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { email, login, id } = user.accountData;

    return { email, login, userId: id };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUserInfo() userInfo: UserInfoType) {
    const command = new DeleteActiveSessionSqlCommand(userInfo.deviceId);
    await this.commandBus.execute(command);
  }
}

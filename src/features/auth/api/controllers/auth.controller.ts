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
import { RateLimitInterceptor } from '../../../../infra/interceptors/rate-limit.interceptor.ts';
import { getDeviceInfo } from '../../../../infra/utils/device-handler';
import {
  ErrorType,
  makeErrorsMessages,
} from '../../../../infra/utils/error-handler';
import { UserAccountDocument } from '../../../admin/domain/entities/userAccount.schema';
import { InputSessionDataValidator } from '../../../security/api/models/security-input.models/create-session.model';
import { DeleteActiveSessionCommand } from '../../../security/application/use-cases/commands/delete-active-session.command';
import { UpdateIssuedTokenCommand } from '../../../security/application/use-cases/commands/update-Issued-token.command';
import { AuthService } from '../../application/auth.service';
import { ConfirmEmailCommand } from '../../application/use-cases/commands/confirm-email.command';
import { CreateSessionCommand } from '../../application/use-cases/commands/create-session.command';
import { CreateTempAccountCommand } from '../../application/use-cases/commands/create-temp-account.command';
import { CreateUserCommand } from '../../application/use-cases/commands/create-user.command';
import { PasswordRecoveryCommand } from '../../application/use-cases/commands/recovery-password.command';
import { UpdateConfirmationCodeCommand } from '../../application/use-cases/commands/update-confirmation-code.command';
import { UpdatePasswordForNonExistAccountCommand } from '../../application/use-cases/commands/update-password-for-non-existing-account.command';
import { UpdatePasswordForExistingAccountCommand } from '../../application/use-cases/commands/update-password-sql.command';
import { GetClientInfo } from '../../infrastructure/decorators/client-ip.decorator';
import { CurrentUserInfo } from '../../infrastructure/decorators/current-user-info.decorator';
import { AccessTokenGuard } from '../../infrastructure/guards/accessToken.guard';
import { LocalAuthGuard } from '../../infrastructure/guards/local-auth.guard';
import { RefreshTokenGuard } from '../../infrastructure/guards/refreshToken.guard';
import { InputRecoveryEmailModel } from '../models/auth-input.models.ts/input-password-rec.type';
import { InputRecoveryPassModel } from '../models/auth-input.models.ts/input-recovery.model';
import { InputRegistrationCodeModel } from '../models/auth-input.models.ts/input-registration-code.model';
import { InputRegistrationModel } from '../models/auth-input.models.ts/input-registration.model';
import { UserInfoType } from '../models/user-models';
import { AuthQueryRepository } from '../query-repositories/auth-query-repo';

type ClientInfo = {
  ip: string;
  userAgentInfo: any;
};

@Controller('auth')
export class AuthController {
  constructor(
    private authQueryRepository: AuthQueryRepository,
    private authService: AuthService,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(LocalAuthGuard)
  @UseInterceptors(RateLimitInterceptor)
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
      userPayload,
      browser,
      deviceType,
      ip: clientInfo.ip,
      userAgentInfo: clientInfo.userAgentInfo,
      userId: userInfo.userId,
      refreshToken,
    };

    const command = new CreateSessionCommand(createSessionData);

    await this.commandBus.execute<CreateSessionCommand, OutputId>(command);

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

    const issuedAt = new Date(userInfoAfterRefresh!.iat * 1000).toISOString()

    const command = new UpdateIssuedTokenCommand(deviceId, issuedAt);

    await this.commandBus.execute(command);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    res.send({ accessToken });
  }

  @UseInterceptors(RateLimitInterceptor)
  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: InputRecoveryPassModel) {
    const userAccount = await this.authQueryRepository.findUserByRecoveryCode(
      body.recoveryCode,
    );

    if (userAccount) {
      const command = new UpdatePasswordForExistingAccountCommand(body);

      return this.commandBus.execute<
        UpdatePasswordForExistingAccountCommand,
        boolean
      >(command);
    }

    const command = new UpdatePasswordForNonExistAccountCommand(body);

    const updatedPassword = await this.commandBus.execute<
      UpdatePasswordForNonExistAccountCommand,
      boolean
    >(command);

    if (updatedPassword) {
      throw new NotFoundException();
    }
  }

  @UseInterceptors(RateLimitInterceptor)
  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() inputEmailModel: InputRecoveryEmailModel) {
    const foundUserAccount = await this.authQueryRepository.findByLoginOrEmail(
      inputEmailModel,
    );

    if (!foundUserAccount) {
      const command = new CreateTempAccountCommand(inputEmailModel);

      await this.commandBus.execute<CreateTempAccountCommand, OutputId>(
        command,
      );

      return;
    }

    const command = new PasswordRecoveryCommand(inputEmailModel);

    const recoveredPassword = await this.commandBus.execute<
      PasswordRecoveryCommand,
      boolean
    >(command);
  }

  @Post('registration')
  @UseInterceptors(RateLimitInterceptor)
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

    const command = new CreateUserCommand(inputModel);

    await this.commandBus.execute<CreateUserCommand, UserAccountDocument>(
      command,
    );
  }

  @UseInterceptors(RateLimitInterceptor)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async registrationConfirmation(
    @Body() inputCode: InputRegistrationCodeModel,
    @Res({ passthrough: true }) res: Response,
  ) {
    const command = new ConfirmEmailCommand(inputCode);

    const confirmedUser = await this.commandBus.execute<
      ConfirmEmailCommand,
      boolean
    >(command);

    if (!confirmedUser) {
      const errors = makeErrorsMessages('code');
      res.status(HttpStatus.BAD_REQUEST).send(errors);
    }
  }

  @UseInterceptors(RateLimitInterceptor)
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
    const command = new UpdateConfirmationCodeCommand(confirmedUser);

    await this.commandBus.execute(command);
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getProfile(@CurrentUserInfo() userInfo: UserInfoType) {
    const user = await this.authQueryRepository.getUserById(userInfo.userId);

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
    const command = new DeleteActiveSessionCommand(userInfo.deviceId);
    await this.commandBus.execute(command);
  }
}

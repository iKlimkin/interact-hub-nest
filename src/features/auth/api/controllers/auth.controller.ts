import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthUserType } from '../models/auth.output.models/auth.user.types';
import { UsersQueryRepository } from 'src/features/admin/api/query-repositories/users.query.repo';
import {
  InputEmail,
  PasswordRecoveryType,
} from '../models/auth-input.models.ts/input-password-rec.type';

@Controller('auth')
export class AuthController {
  constructor(
    // private authQueryRepository: AuthQueryRepository,
    private usersQueryRepo: UsersQueryRepository,
    // private authUserService: AuthUserService,
    // private securityService: SecurityService
  ) {}

  //   @Post('login')
  //   async login(
  //     @Body() body: LoginCredentials,
  //     @Req() req: Request,
  //   @Res() res: Response,
  //   ) {
  //     const { loginOrEmail, password } = body;

  //     const forwardedIpsStr =
  //       req.headers("x-forwarded-for") || req.socket.remoteAddress || "";
  //     const ip = forwardedIpsStr.split(",")[0];

  //     let userAgentInfo = req.useragent;

  //     const authResult = await this.authUserService.checkCredentials({
  //       loginOrEmail,
  //       password,
  //     });

  //     if (!authResult.data) {
  //       const { status, errorsMessages } = handleAuthResult(authResult);
  //       res.status(status).send({ errorsMessages });
  //       return;
  //     }

  //     const { id: userId } = authResult.data;

  //     const { accessToken, refreshToken } = jwtService.createJWT(userId);

  //     const userInfo = jwtService.getUserPayloadByToken(refreshToken);

  //     const { browser, deviceType } = getDeviceInfo(userAgentInfo);

  //     const createSessionData = {
  //       userInfo: userInfo!,
  //       browser,
  //       deviceType,
  //       ip,
  //       userAgentInfo,
  //       userId,
  //       refreshToken,
  //     };

  //     await this.securityService.createUserSession(createSessionData);

  //     res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });

  //     res.send({ accessToken });
  //   }

  //   async refreshToken(req: Request, res: Response) {
  //     const { userId, deviceId } = res.locals;

  //     const { accessToken, refreshToken } = jwtService.updateUserTokens(
  //       userId,
  //       deviceId
  //     );

  //     const userInfoAfterRefresh = jwtService.getUserPayloadByToken(refreshToken);

  //     if (!userInfoAfterRefresh) {
  //       res.sendStatus(HTTP_STATUSES.CONFLICT_409);
  //       return;
  //     }

  //     const issuedAt = new Date(userInfoAfterRefresh.iat * 1000).toISOString();

  //     await this.securityService.updateIssuedToken(deviceId, issuedAt);

  //     res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
  //     res.send({ accessToken });
  //   }

  // @Post('new-password')
  // async newPassword(@Body() body: PasswordRecoveryType, @Res() res: Response) {
  //   const { newPassword, recoveryCode } = body;

  //   const updatedPassword = await this.authUserService.updatePassword({
  //     newPassword,
  //     recoveryCode,
  //   });

  //   // if (!updatedPassword.data) {
  //   //   const { status, errorsMessages } = handleAuthResult(updatedPassword);
  //   //   res.status(status).send({ errorsMessages });
  //   //   return;
  //   // }

  //   res.sendStatus(HttpStatus.NO_CONTENT);
  // }

  // @Post('password-recovery')
  // async passwordRecovery(@Body() body: InputEmail, @Res() res: Response) {
  //   const { email } = body;

  //   const foundUserAccount = await this.authQueryRepository.findByLoginOrEmail({
  //     email,
  //   });

  //   if (!foundUserAccount) {
  //     const codeForNonExistentUser =
  //       await this.authUserService.createTemporaryUserAccount(email);

  //     if (!codeForNonExistentUser.data) {
  //       const { status, errorsMessages } = handleAuthResult(
  //         codeForNonExistentUser,
  //       );
  //       res.status(status).send({ errorsMessages });
  //       return;
  //     }

  //     res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  //     return;
  //   }

  //   const recoveredPassword =
  //     await this.authUserService.passwordRecovery(email);

  //   if (!recoveredPassword.data) {
  //     const { status, errorsMessages } = handleAuthResult(recoveredPassword);
  //     res.status(status).send({ errorsMessages });
  //     return;
  //   }

  //   res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  // }

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

  //   const user = await this.authUserService.createUser({
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

  //   const confirmedUser = await this.authUserService.confirmEmail(code);

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
  //     await this.authUserService.updateConfirmationCode(confirmedUser);

  //   if (!updatedUserConfirmation.data) {
  //     const { status, errorsMessages } = handleAuthResult(
  //       updatedUserConfirmation,
  //     );
  //     res.status(status).send({ errorsMessages });
  //     return;
  //   }

  //   res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  // }

  // async me(req: Request, res: Response) {
  //   const { userId } = res.locals;

  //   const user = await this.usersQueryRepo.getUserById(userId);

  //   if (!user) {
  //     res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  //     return;
  //   }

  //   const userViewModel = {
  //     email: user.email,
  //     login: user.login,
  //     userId,
  //   };

  //   res.send(userViewModel);
  // }

  // async logout(req: Request, res: Response) {
  //   const { deviceId } = res.locals;

  //   await this.securityService.deleteActiveSession(deviceId);

  //   res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  // }
}

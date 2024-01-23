import { Provider } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApiRequestCounterService } from '../../../../infra/application/api-request-counter.service';
import { RateLimitInterceptor } from '../../../../infra/interceptors/rate-limit.interceptor.ts';
import { ApiRequestCounterRepository } from '../../../../infra/repositories/api-request-counter.repository';
import { UsersQueryRepository } from '../../../admin/api/query-repositories/users.query.repo';
import { AdminUserService } from '../../../admin/application/user.admins.service';
import { UsersRepository } from '../../../admin/infrastructure/users.repository';
import { SecurityQueryRepo } from '../../../security/api/query-repositories/security.query.repo';
import { SecurityService } from '../../../security/application/security.service';
import { SecurityRepository } from '../../../security/infrastructure/security.repository';
import { AuthQueryRepository } from '../../api/query-repositories/auth-query-repo';
import { CheckCredentialsUseCase } from '../../application/use-cases/check-credentials.use-case';
import { ConfirmEmailUseCase } from '../../application/use-cases/confirm-email-use-case';
import { CreateTempAccountUseCase } from '../../application/use-cases/create-temprorary-account.use-case';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { PasswordRecoveryUseCase } from '../../application/use-cases/recovery-password.use-case';
import { SendRecoveryMsgUseCase } from '../../application/use-cases/send-recovery-msg.use-case';
import { UpdateConfirmationCodeUseCase } from '../../application/use-cases/update-confirmation-code.use-case';
import { UpdatePasswordUseCase } from '../../application/use-cases/update-password.use-case';
import { AuthUsersRepository } from '../authUsers-repository';
import { BasicSAStrategy } from '../guards/strategies/basic-strategy';
import {
  AccessTokenStrategy,
  RefreshTokenStrategy,
} from '../guards/strategies/jwt-strategy';
import { LocalStrategy } from '../guards/strategies/local-strategy';
import { UserCreatedEventHandler } from '../../application/use-cases/events/handlers/user-created.event-handler';
import { EmailAdapter } from '../../../../infra/adapters/email-adapter';
import { EmailManager } from '../../../../infra/application/managers/email-manager';
import { BcryptAdapter } from '../../../../infra/adapters/bcrypt-adapter';
import { CreateUserSessionUseCase } from '../../application/use-cases/create-user-session.use-case';
import { UpdateIssuedTokenUseCase } from '../../../security/application/use-cases/update-issued-token.use-case';
import { DeleteActiveSessionUseCase } from '../../../security/application/use-cases/delete-active-session.use-case';
import { DeleteOtherUserSessionsUseCase } from '../../../security/application/use-cases/delete-other-user-sessions.use-case';

export const userAccountProviders: Provider[] = [
  AuthUsersRepository,
  AuthQueryRepository,
];

export const usersProviders: Provider[] = [
  AdminUserService,
  UsersQueryRepository,
  UsersRepository,
];

export const Strategies: Provider[] = [
  AccessTokenStrategy,
  RefreshTokenStrategy,
  BasicSAStrategy,
  LocalStrategy,
];

export const requestLoggerProviders: Provider[] = [
  ApiRequestCounterService,
  ApiRequestCounterRepository,
];

export const RequestLoggerInterseptor = {
  provide: APP_INTERCEPTOR,
  useClass: RateLimitInterceptor,
};

export const securitiesProviders: Provider[] = [
  SecurityService,
  SecurityRepository,
  SecurityQueryRepo,
];

export const authUseCases: Provider[] = [
  CreateUserUseCase,
  CheckCredentialsUseCase,
  CreateTempAccountUseCase,
  SendRecoveryMsgUseCase,
  PasswordRecoveryUseCase,
  UpdatePasswordUseCase,
  ConfirmEmailUseCase,
  UpdateConfirmationCodeUseCase,
  CreateUserSessionUseCase,
  UpdateIssuedTokenUseCase,
];

export const securityUseCases: Provider[] = [
  DeleteActiveSessionUseCase,
  DeleteOtherUserSessionsUseCase,
];

export const authEventHandlers: Provider[] = [UserCreatedEventHandler];

export const adapters: Provider[] = [BcryptAdapter, EmailManager, EmailAdapter];

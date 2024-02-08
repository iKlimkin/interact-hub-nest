import { Provider } from '@nestjs/common';
import { BcryptAdapter } from '../../../../infra/adapters/bcrypt-adapter';
import { EmailAdapter } from '../../../../infra/adapters/email-adapter';
import { EmailManager } from '../../../../infra/application/managers/email-manager';
import { ApiRequestCounterRepository } from '../../../../infra/logging/api-request-counter.repository';
import { ApiRequestCounterService } from '../../../../infra/logging/api-request-counter.service';
import { UsersQueryRepository } from '../../../admin/api/query-repositories/users.query.repo';
import { AdminUserService } from '../../../admin/application/user.admins.service';
import { UsersRepository } from '../../../admin/infrastructure/users.repository';
import { SecurityQueryRepo } from '../../../security/api/query-repositories/security.query.repo';
import { SecurityService } from '../../../security/application/security.service';
import { DeleteActiveSessionUseCase } from '../../../security/application/use-cases/delete-active-session.use-case';
import { DeleteOtherUserSessionsUseCase } from '../../../security/application/use-cases/delete-other-user-sessions.use-case';
import { UpdateIssuedTokenUseCase } from '../../../security/application/use-cases/update-issued-token.use-case';
import { SecurityRepository } from '../../../security/infrastructure/security.repository';
import { AuthQueryRepository } from '../../api/query-repositories/auth-query-repo';
import { CheckCredentialsUseCase } from '../../application/use-cases/check-credentials.use-case';
import { ConfirmEmailUseCase } from '../../application/use-cases/confirm-email-use-case';
import { CreateTempAccountUseCase } from '../../application/use-cases/create-temporary-account.use-case';
import { CreateUserSessionUseCase } from '../../application/use-cases/create-user-session.use-case';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { UserCreatedEventHandler } from '../../application/use-cases/events/handlers/user-created.event-handler';
import { PasswordRecoveryUseCase } from '../../application/use-cases/recovery-password.use-case';
import { SendRecoveryMsgUseCase } from '../../application/use-cases/send-recovery-msg.use-case';
import { UpdateConfirmationCodeUseCase } from '../../application/use-cases/update-confirmation-code.use-case';
import { UpdatePasswordForExistingAccountUseCase } from '../../application/use-cases/update-password-existing-account.use-case';
import { UpdatePasswordForNonExistAccountUseCase } from '../../application/use-cases/update-password-non-exist-account.use-case';
import { AuthUsersRepository } from '../auth-users.repository';
import { BasicSAStrategy } from '../guards/strategies/basic-strategy';
import {
  AccessTokenStrategy,
  RefreshTokenStrategy,
} from '../guards/strategies/jwt-strategy';
import { LocalStrategy } from '../guards/strategies/local-strategy';
import { UsersSQLRepository } from '../../../admin/infrastructure/users.sql-repository';
import { DeleteSAUseCase } from '../../../admin/application/use-cases/delete-sa.use.case';
import { CreateSAUseCase } from '../../../admin/application/use-cases/create-sa.use.case';
import { UsersSQLQueryRepository } from '../../../admin/api/query-repositories/users.sql-query.repo';
import { CreateUserSQLUseCase } from '../../application/use-cases/create-user-sql.use-case';

export const userAccountProviders: Provider[] = [
  AuthUsersRepository,
  AuthQueryRepository,
];

export const usersProviders: Provider[] = [
  AdminUserService,
  UsersQueryRepository,
  UsersRepository,
  UsersSQLRepository,
  UsersSQLQueryRepository,
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
  UpdatePasswordForExistingAccountUseCase,
  UpdatePasswordForNonExistAccountUseCase,
  ConfirmEmailUseCase,
  UpdateConfirmationCodeUseCase,
  CreateUserSessionUseCase,
  UpdateIssuedTokenUseCase,
];

export const authSQLUseCases: Provider[] = [
  CreateUserSQLUseCase,
  CreateSAUseCase,
  DeleteSAUseCase,
]

export const securityUseCases: Provider[] = [
  DeleteActiveSessionUseCase,
  DeleteOtherUserSessionsUseCase,
];

export const authEventHandlers: Provider[] = [UserCreatedEventHandler];

export const adapters: Provider[] = [BcryptAdapter, EmailManager, EmailAdapter];

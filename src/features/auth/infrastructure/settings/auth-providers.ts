import { Provider } from '@nestjs/common';
import { BcryptAdapter } from '../../../../infra/adapters/bcrypt-adapter';
import { EmailAdapter } from '../../../../infra/adapters/email-adapter';
import { EmailManager } from '../../../../infra/application/managers/email-manager';
import { ApiRequestCounterRepository } from '../../../../infra/logging/infra/api-request-counter.repository';
import { ApiRequestCounterService } from '../../../../infra/logging/application/api-request-counter.service';
import { ApiRequestCounterSQLRepository } from '../../../../infra/logging/infra/api-request-counter.sql-repository';
import { UsersQueryRepository } from '../../../admin/api/query-repositories/users.query.repo';
import { UsersSqlQueryRepository } from '../../../admin/api/query-repositories/users.query.sql-repo';
import { CreateSAUseCase } from '../../../admin/application/use-cases/create-sa.use.case';
import { DeleteSAUseCase } from '../../../admin/application/use-cases/delete-sa.use.case';
import { AdminUserService } from '../../../admin/application/user.admins.service';
import { UsersRepository } from '../../../admin/infrastructure/users.repository';
import { UsersSQLRepository } from '../../../admin/infrastructure/users.sql-repository';
import { SecurityQueryRepo } from '../../../security/api/query-repositories/security.query.repo';
import { SecurityTORQueryRepo } from '../../../security/api/query-repositories/security.query.tor-repo';
import { SecurityService } from '../../../security/application/security.service';
import { CreateUserSessionSQLUseCase } from '../../../security/application/use-cases/create-user-session-sql.use-case';
import { DeleteActiveSessionSqlUseCase } from '../../../security/application/use-cases/delete-active-session-sql.use-case';
import { DeleteActiveSessionUseCase } from '../../../security/application/use-cases/delete-active-session.use-case';
import { DeleteOtherUserSessionsSqlUseCase } from '../../../security/application/use-cases/delete-other-user-sessions-sql.use-case';
import { DeleteOtherUserSessionsUseCase } from '../../../security/application/use-cases/delete-other-user-sessions.use-case';
import { UpdateIssuedTokenSqlUseCase } from '../../../security/application/use-cases/update-issued-token-sql.use-case';
import { UpdateIssuedTokenUseCase } from '../../../security/application/use-cases/update-issued-token.use-case';
import { SecurityRepository } from '../../../security/infrastructure/security.repository';
import { SecuritySqlRepository } from '../../../security/infrastructure/security.sql-repository';
import { AuthQueryRepository } from '../../api/query-repositories/auth-query-repo';
import { AuthQuerySqlRepository } from '../../api/query-repositories/auth-query.sql-repo';
import { CheckCredentialsSQLUseCase } from '../../application/use-cases/check-credentials-sql.use-case';
import { CheckCredentialsUseCase } from '../../application/use-cases/check-credentials.use-case';
import { ConfirmEmailSqlUseCase } from '../../application/use-cases/confirm-email-sql.use-case';
import { ConfirmEmailUseCase } from '../../application/use-cases/confirm-email.use-case';
import { CreateTemporaryAccountSqlUseCase } from '../../application/use-cases/create-temporary-account-sql.use-case';
import { CreateTempAccountUseCase } from '../../application/use-cases/create-temporary-account.use-case';
import { CreateUserSessionUseCase } from '../../application/use-cases/create-user-session.use-case';
import { CreateUserSQLUseCase } from '../../application/use-cases/create-user-sql.use-case';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { CreateUserAccountEventHandler } from '../../application/use-cases/events/handlers/create-user-account-sql.event-handler';
import { UserCreatedEventHandler } from '../../application/use-cases/events/handlers/user-created.event-handler';
import { PasswordRecoverySqlUseCase } from '../../application/use-cases/recovery-password-sql.use-case';
import { PasswordRecoveryUseCase } from '../../application/use-cases/recovery-password.use-case';
import { SendRecoveryMsgUseCase } from '../../application/use-cases/send-recovery-msg.use-case';
import { UpdateConfirmationCodeSqlUseCase } from '../../application/use-cases/update-confirmation-code-sql.use-case';
import { UpdateConfirmationCodeUseCase } from '../../application/use-cases/update-confirmation-code.use-case';
import { UpdatePasswordForExistingAccountUseCase } from '../../application/use-cases/update-password-existing-account.use-case';
import { UpdatePasswordForNonExistAccountUseCase } from '../../application/use-cases/update-password-non-exist-account.use-case';
import { UpdatePasswordSqlUseCase } from '../../application/use-cases/update-password-sql.use-case';
import { UpdatePasswordTemporaryAccountSqlUseCase } from '../../application/use-cases/update-password-temporary-account-sql.use-case';
import { AuthUsersRepository } from '../auth-users.repository';
import { AuthUsersSqlRepository } from '../auth-users.sql-repository';
import { BasicSAStrategy } from '../guards/strategies/basic-strategy';
import {
  AccessTokenStrategy,
  RefreshTokenStrategy,
} from '../guards/strategies/jwt-strategy';
import { LocalStrategy } from '../guards/strategies/local-strategy';
import { UsersQueryRepo } from '../../../admin/infrastructure/users.query.typeorm-repo';
import { LoggerService } from '../../../../infra/logging/application/logger.service';
import { SecurityTORRepository } from '../../../security/infrastructure/security.tor-repository';
import { UserAccountsTORRepo } from '../../../admin/infrastructure/users.typeorm-repo';
import { AuthUsersTORRepository } from '../auth-users.tor-repository';
import { SecuritySqlQueryRepo } from '../../../security/api/query-repositories/security.query.sql-repo';
import { AuthQueryTORRepository } from '../../api/query-repositories/auth-query.tor-repo';

export const userAccountProviders: Provider[] = [
  AuthUsersRepository,
  AuthQueryRepository,
  AuthUsersSqlRepository,
  AuthQuerySqlRepository,
  AuthQueryTORRepository,
  AuthUsersTORRepository,
];

export const usersProviders: Provider[] = [
  AdminUserService,
  UsersQueryRepository,
  UsersRepository,
  UsersSQLRepository,
  UsersSqlQueryRepository,
  UsersQueryRepo,
  UserAccountsTORRepo,
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
  ApiRequestCounterSQLRepository,
];

export const securitiesProviders: Provider[] = [
  SecurityService,
  SecurityRepository,
  SecurityQueryRepo,
  SecuritySqlRepository,
  SecuritySqlQueryRepo,
  SecurityTORRepository,
  SecurityTORQueryRepo,
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
  UpdateIssuedTokenSqlUseCase,
  CheckCredentialsSQLUseCase,
  CreateTemporaryAccountSqlUseCase,
  UpdatePasswordTemporaryAccountSqlUseCase,
  PasswordRecoverySqlUseCase,
  UpdatePasswordSqlUseCase,
  ConfirmEmailSqlUseCase,
  UpdateConfirmationCodeSqlUseCase,
  CreateSAUseCase,
  DeleteSAUseCase,
];

export const securitySQLUseCases: Provider[] = [
  CreateUserSessionSQLUseCase,
  DeleteOtherUserSessionsSqlUseCase,
  DeleteActiveSessionSqlUseCase,
];

export const securityUseCases: Provider[] = [
  DeleteActiveSessionUseCase,
  DeleteOtherUserSessionsUseCase,
];

export const authEventHandlers: Provider[] = [
  UserCreatedEventHandler,
  CreateUserAccountEventHandler,
];

export const adapters: Provider[] = [
  BcryptAdapter,
  EmailManager,
  EmailAdapter,
  LoggerService,
];

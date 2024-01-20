import { Provider } from '@nestjs/common';
import { BasicSAStrategy } from '../guards/strategies/basic-strategy';
import {
  AccessTokenStrategy,
  RefreshTokenStrategy,
} from '../guards/strategies/jwt-strategy';
import { LocalStrategy } from '../guards/strategies/local-strategy';
import { AuthQueryRepository } from '../../api/query-repositories/auth-query-repo';
import { AuthUserService } from '../../application/auth-user.service';
import { AuthRepository } from '../authUsers-repository';
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

export const userAccountProviders: Provider[] = [
  AuthUserService,
  AuthRepository,
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

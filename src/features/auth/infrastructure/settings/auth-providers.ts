import { Provider } from '@nestjs/common';
import { UsersQueryRepository } from 'src/features/admin/api/query-repositories/users.query.repo';
import { AdminUserService } from 'src/features/admin/application/user.admins.service';
import { UsersRepository } from 'src/features/admin/infrastructure/users.repository';
import { BasicSAStrategy } from '../guards/strategies/basic-strategy';
import {
  AccessTokenStrategy,
  RefreshTokenStrategy,
} from '../guards/strategies/jwt-strategy';
import {  LocalStrategy } from '../guards/strategies/local-strategy';
import { AuthQueryRepository } from '../../api/query-repositories/auth-query-repo';
import { AuthUserService } from '../../application/auth.service';
import { AuthRepository } from '../authUsers-repository';

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

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { BcryptAdapter } from '../../infra/adapters/bcrypt-adapter';
import { AuthService } from './application/auth.service';
import { SuperAdminsController } from '../admin/api/controllers/super-admin.controller';
import { UsersQueryRepository } from '../admin/api/query-repositories/users.query.repo';
import { UsersRepository } from '../admin/infrastructure/users.repository';
import { SecurityQueryRepo } from '../security/api/query-repositories/security.query.repo';
import { SecurityService } from '../security/application/security.service';
import { AuthController } from './api/controllers/auth.controller';
import {
  RequestLoggerInterseptor,
  Strategies,
  adapters,
  authEventHandlers,
  authUseCases,
  requestLoggerProviders,
  securitiesProviders,
  userAccountProviders,
  usersProviders,
} from './infrastructure/settings/auth-providers';
import { mongooseModels } from './infrastructure/settings/mongoose-models';

@Module({
  imports: [
    CqrsModule,
    JwtModule.register({}),
    PassportModule,
    MongooseModule.forFeature(mongooseModels),
  ],

  providers: [
    ...Strategies,
    ...authEventHandlers,
    RequestLoggerInterseptor,
    ...authUseCases,
    ...requestLoggerProviders,

    ...adapters,

    AuthService,

    ...securitiesProviders,

    ...userAccountProviders,
    ...usersProviders,
  ],
  controllers: [AuthController, SuperAdminsController],
  exports: [
    JwtModule,
    BcryptAdapter,
    UsersRepository,
    UsersQueryRepository,
    SecurityService,
    SecurityQueryRepo,
  ],
})
export class AuthModule {}

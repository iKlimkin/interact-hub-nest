import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { BcryptAdapter } from '../../infra/adapters/bcrypt-adapter';
import { EmailAdapter } from '../../infra/adapters/email-adapter';
import { AuthService } from '../../infra/application/auth.service';
import { EmailManager } from '../../infra/application/managers/email-manager';
import { SuperAdminsController } from '../admin/api/controllers/super-admin.controller';
import { UsersQueryRepository } from '../admin/api/query-repositories/users.query.repo';
import { UsersRepository } from '../admin/infrastructure/users.repository';
import { SecurityQueryRepo } from '../security/api/query-repositories/security.query.repo';
import { SecurityService } from '../security/application/security.service';
import { AuthController } from './api/controllers/auth.controller';
import { getAuthConfiguration } from './config/configuration';
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
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    CqrsModule,
    JwtModule.register({}),
    PassportModule,
    MongooseModule.forFeature(mongooseModels),
    ConfigModule.forFeature(getAuthConfiguration),
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

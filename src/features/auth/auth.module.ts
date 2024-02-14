import { DynamicModule, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { BcryptAdapter } from '../../infra/adapters/bcrypt-adapter';
import { UsersQueryRepository } from '../admin/api/query-repositories/users.query.repo';
import { UsersRepository } from '../admin/infrastructure/users.repository';
import { SecurityQueryRepo } from '../security/api/query-repositories/security.query.repo';
import { SecurityService } from '../security/application/security.service';
import { AuthService } from './application/auth.service';
import {
  authControllers,
  authSqlControllers,
} from './infrastructure/settings/auth-controllers';
import {
  Strategies,
  adapters,
  authEventHandlers,
  authSQLUseCases,
  authUseCases,
  requestLoggerProviders,
  securitiesProviders,
  securitySQLUseCases,
  securityUseCases,
  userAccountProviders,
  usersProviders,
} from './infrastructure/settings/auth-providers';
import { mongooseModels } from './infrastructure/settings/mongoose-models';

@Module({
  imports: [
    JwtModule.register({}),
    PassportModule,
    MongooseModule.forFeature(mongooseModels),
    CqrsModule,
  ],

  providers: [
    ...Strategies,
    ...authEventHandlers,

    ...authUseCases,
    ...requestLoggerProviders,
    ...adapters,

    AuthService,

    ...securitiesProviders,
    ...securityUseCases,
    ...securitySQLUseCases,
    ...userAccountProviders,
    ...usersProviders,

    ...authSQLUseCases,
  ],
  controllers:
    process.env.MAIN_DB === 'MONGO'
      ? authControllers
      : authSqlControllers,
  exports: [
    JwtModule,
    BcryptAdapter,
    UsersRepository,
    UsersQueryRepository,
    SecurityService,
    SecurityQueryRepo,
    CqrsModule,
  ],
})
export class AuthModule {}

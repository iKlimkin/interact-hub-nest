import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
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
import { UsersSqlQueryRepository } from '../admin/api/query-repositories/users.query.sql-repo';
import { UsersSQLRepository } from '../admin/infrastructure/users.sql-repository';
import { SecuritySqlQueryRepo } from '../security/api/query-repositories/security.query.sql-repo';

@Module({
  imports: [
    JwtModule.register({}),
    PassportModule,
    MongooseModule.forFeature(mongooseModels),
    CqrsModule,
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 10000,
        limit: 50,
      },
    ]),
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
    process.env.MAIN_DB === 'MONGO' ? authControllers : authSqlControllers,
  exports: [
    JwtModule,
    BcryptAdapter,
    UsersRepository,
    UsersSQLRepository,
    UsersQueryRepository,
    UsersSqlQueryRepository,
    SecurityService,
    SecurityQueryRepo,
    SecuritySqlQueryRepo,
    CqrsModule,
  ],
})
export class AuthModule {}

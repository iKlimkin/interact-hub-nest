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
  Strategies,
  adapters,
  authEventHandlers,
  authSQLUseCases,
  authUseCases,
  requestLoggerProviders,
  securitiesProviders,
  securityUseCases,
  userAccountProviders,
  usersProviders,
} from './infrastructure/settings/auth-providers';
import { mongooseModels } from './infrastructure/settings/mongoose-models';
import { UsersSQLRepository } from '../admin/infrastructure/users.sql-repository';
import { SuperAdminsSQLController } from '../admin/api/controllers/super-admin.sql.controller';
import { AuthSQLController } from './api/controllers/auth-sql.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmOptions } from '../../settings/postgres-options';
import { authSQLControllers } from './infrastructure/settings/auth-controllers';

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
    ...userAccountProviders,
    ...usersProviders,

    ...authSQLUseCases,
  ],
  controllers: authSQLControllers,
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

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersSqlQueryRepository } from '../admin/api/query-repositories/users.query.sql-repo';
import { UserAccount } from '../admin/domain/entities/user-account.entity';
import { UsersRepository } from '../admin/infrastructure/users.repository';
import { UsersSQLRepository } from '../admin/infrastructure/users.sql-repository';
import { UserAccountsTORRepo } from '../admin/infrastructure/users.typeorm-repo';
import { UserSession } from '../security/domain/entities/security.entity';
import { AuthService } from './application/auth.service';
import { TemporaryUserAccount } from './domain/entities/temp-account.entity';
import {
  authControllers,
  usersSqlControllers,
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
import { UsersQueryRepo } from '../admin/infrastructure/users.query.typeorm-repo';

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
    TypeOrmModule.forFeature([UserAccount, UserSession, TemporaryUserAccount]),
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
    process.env.MAIN_DB === 'MONGO' ? authControllers : usersSqlControllers,
  exports: [
    JwtModule,
    UsersRepository,
    UsersSQLRepository,
    UserAccountsTORRepo,
    UsersQueryRepo,
    UsersSqlQueryRepository,
    CqrsModule,
  ],
})
export class AuthModule {}

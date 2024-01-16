import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { BcryptAdapter } from 'src/infra/adapters/bcrypt-adapter';
import { EmailAdapter } from 'src/infra/adapters/email-adapter';
import { AuthService } from 'src/infra/application/auth.service';
import { EmailManager } from 'src/infra/application/managers/email-manager';
import { SuperAdminsController } from '../admin/api/controllers/super-admin.controller';
import { UsersQueryRepository } from '../admin/api/query-repositories/users.query.repo';
import { UsersRepository } from '../admin/infrastructure/users.repository';
import { SecurityService } from '../security/application/security.service';
import { SecurityRepository } from '../security/infrastructure/security.repository';
import { AuthController } from './api/controllers/auth.controller';
import { jwtConstants } from './infrastructure/guards/constants';
import {
  RequestLoggerInterseptor,
  Strategies,
  requestLoggerProviders,
  userAccountProviders,
  usersProviders,
} from './infrastructure/settings/auth-providers';
import { mongooseModels } from './infrastructure/settings/mongoose-models';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    JwtModule.register({}),
    PassportModule,
    MongooseModule.forFeature(mongooseModels),
  ],

  providers: [
    ...Strategies,

    RequestLoggerInterseptor,

  ...requestLoggerProviders,

    EmailManager,
    EmailAdapter,
    BcryptAdapter,

    AuthService,

    SecurityService,
    SecurityRepository,

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
  ],
})
export class AuthModule {}

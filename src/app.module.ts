import { configModule } from './settings/app-config.module';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './features/auth/auth.module';
import { controllers } from './settings/app-controllers';
import { providers } from './settings/app-providers';
import { createAsyncMongoConnection } from './settings/app.settings';
import { mongooseSchemas } from './settings/mongoose-schemas';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmOptions } from './settings/postgres-options';

@Module({
  imports: [
    CqrsModule,
    configModule,
    MongooseModule.forRootAsync({
      useFactory: createAsyncMongoConnection,
      inject: [ConfigService],
    }),
    MongooseModule.forFeature(mongooseSchemas),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmOptions,
    }),
    AuthModule,
  ],
  exports: [TypeOrmModule],
  controllers,
  providers,
})
export class AppModule {}

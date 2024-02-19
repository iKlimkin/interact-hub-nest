import { configModule } from './settings/app-config.module';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    configModule,
    MongooseModule.forRootAsync({
      useFactory: createAsyncMongoConnection,
      inject: [ConfigService],
  }),
    MongooseModule.forFeature(mongooseSchemas),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useClass: TypeOrmOptions,
    }),
    AuthModule,
  ],
  controllers,
  providers,
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './features/auth/auth.module';
import { configModule } from './settings/app-config.module';
import { controllers } from './settings/app-controllers';
import { providers } from './settings/app-providers';
import { createMongoConnection } from './settings/app.settings';
import { entities } from './settings/entities';
import { mongooseSchemas } from './settings/mongoose-schemas';
import { TypeOrmOptions } from './settings/typeorm-options';

@Module({
  imports: [
    configModule,
    MongooseModule.forRootAsync({
      useFactory: createMongoConnection,
      inject: [ConfigService],
    }),
    MongooseModule.forFeature(mongooseSchemas),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useClass: TypeOrmOptions,
    }),
    TypeOrmModule.forFeature(entities),
    AuthModule,
  ],
  controllers,
  providers,
})
export class AppModule {}

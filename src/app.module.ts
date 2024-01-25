import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './features/auth/auth.module';
import { configModule } from './settings/app-config.module';
import { controllers } from './settings/app-controllers';
import { providers } from './settings/app-providers';
import { createAsyncMongoConnection } from './settings/app.settings';
import { mongooseSchemas } from './settings/mongoose-schemas';

@Module({
  imports: [
    CqrsModule,
    configModule,
    MongooseModule.forRootAsync({
      useFactory: createAsyncMongoConnection,
      inject: [ConfigService],
    }),
    MongooseModule.forFeature(mongooseSchemas),
    AuthModule,
  ],
  controllers,
  providers,
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import settings from 'src/infra/settings/app.settings';
import { controllers } from './settings/app-controllers';
import { providers } from './settings/app-providers';
import { mongooseSchemas } from './settings/mongoose-schemas';
import { AuthModule } from './features/auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(settings.MONGO_URL),
    MongooseModule.forFeature(mongooseSchemas),
    AuthModule,
  ],
  controllers,
  providers,
})
export class AppModule {}

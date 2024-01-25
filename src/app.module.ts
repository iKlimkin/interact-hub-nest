import { ConfigModule } from '@nestjs/config';
ConfigModule.forRoot()
import { configModule } from './settings/app-config.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import settings from './settings/app.settings';
import { controllers } from './settings/app-controllers';
import { providers } from './settings/app-providers';
import { mongooseSchemas } from './settings/mongoose-schemas';
import { AuthModule } from './features/auth/auth.module';
import { CqrsModule } from '@nestjs/cqrs';
const a = 1;
@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot(),
    // configModule,
    MongooseModule.forRoot(settings.MONGO_URL),
    MongooseModule.forFeature(mongooseSchemas),
    AuthModule,
  ],
  controllers,
  providers,
})
export class AppModule {}

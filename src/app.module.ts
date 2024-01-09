import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import settings from 'src/infra/settings/app.settings';
import { controllers } from './settings/app-controllers';
import { providers } from './settings/app-providers';
import { mongooseSchemas } from './settings/mongoose-schemas';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(settings.MONGO_URL),
    MongooseModule.forFeature(mongooseSchemas),
  ],
  controllers,
  providers,
})
export class AppModule {}

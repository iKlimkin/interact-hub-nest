import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setAppPipes } from './settings/apply-app-settings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // applyAppSettings(app)
  app.enableCors();
  setAppPipes(app);

  await app.listen(process.env.PORT || 5000);
}
bootstrap();

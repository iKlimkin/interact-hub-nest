import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setAppPipes } from './settings/apply-app-settings';
import { ErrorsExceptionFilter, HttpExceptionFilter } from './exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // applyAppSettings(app)
  app.enableCors();
  setAppPipes(app);
  app.useGlobalFilters(new HttpExceptionFilter(), new ErrorsExceptionFilter());
  await app.listen(process.env.PORT || 5000);
}
bootstrap();

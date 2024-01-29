import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError, useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import { AppModule } from '../app.module';
import { HttpExceptionFilter } from '../infra/exception-filters/exception.filter';

export const applyAppSettings = (app: INestApplication) => {
  app.use(cookieParser());
  // Для внедрения зависимостей в validator constraint
  // {fallbackOnErrors: true} требуется, поскольку Nest генерирует исключение,
  // когда DI не имеет необходимого класса.
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Применение глобальных Interceptors
  // app.useGlobalInterceptors()

  // Применение глобальных Guards
  //  app.useGlobalGuards(new AuthGuard());

  // Включение CORS для разрешения запросов от всех доменов
  app.enableCors();

  setAppPipes(app);

  setAppExceptionsFilters(app);
};

type CustomError = {
  message: string;
  field: string;
};

const setAppPipes = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory(errors: ValidationError[]) {
        const customErrors: CustomError[] = [];

        errors.forEach((errors: ValidationError) => {
          const constraints = errors.constraints;

          if (constraints) {
            const constraintKeys = Object.keys(constraints);

            constraintKeys.forEach((cKey: string) => {
              const message = constraints[cKey];

              customErrors.push({ message, field: errors.property });
            });
          }
        });

        throw new BadRequestException(customErrors);
      },
    }),
  );
};

const setAppExceptionsFilters = (app: INestApplication) => {
  app.useGlobalFilters(new HttpExceptionFilter());
};

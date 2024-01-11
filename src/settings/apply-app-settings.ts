import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

type CustomError = {
  key: string;
  message: string;
};

export const setAppPipes = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // трансформация по типам
      stopAtFirstError: true,
      exceptionFactory(errors: ValidationError[]) {
        const customErrors: CustomError[] = [];

        errors.forEach((e: ValidationError) => {
          const constraints = e.constraints;

          if (constraints) {
            const constraintKeys = Object.keys(constraints);

            constraintKeys.forEach((cKey: string) => {
              const msg = constraints[cKey];

              customErrors.push({ key: e.property, message: msg });
            });
          }
        });

        throw new BadRequestException(customErrors);
      },
    }),
  );
};

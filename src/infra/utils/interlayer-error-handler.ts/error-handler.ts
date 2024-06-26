import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LayerInterceptorExtension } from './error-layer-interceptor';
import { GetErrors } from './user-errors';

export const handleErrors = (
  code: number,
  extension: LayerInterceptorExtension[],
) => {
  switch (code) {
    case GetErrors.DatabaseFail:
      return {
        message: extension[0].message,
        error: new InternalServerErrorException(
          `Error occurred in ${extension[0].key}`,
        ),
      };
    case GetErrors.NotFound:
      return {
        message: 'Not Found',
        error: new NotFoundException(extension[0]),
      };
    case GetErrors.IncorrectModel:
      return {
        message: 'Bad Request',
        error: new BadRequestException(extension[0]),
      };
    default:
      return {
        message: 'An unexpected error occurred',
        error: new Error('An unexpected error occurred'),
      };
  }
};

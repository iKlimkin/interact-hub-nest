import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  GoneException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { error } from 'console';
import { Request, Response } from 'express';

type ErrorsMessageType = {
  message: string;
  field: string;
};

type errorsMessages = {
  errorsMessages: ErrorsMessageType[] | [];
};

@Catch(GoneException)
export class ErrorsExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (process.env.environment !== 'product') {
      response
        .status(500)
        .send({ error: exception.toString(), stack: exception.stack });
    } else {
      response.status(500).send('occurred some problems');
    }
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === HttpStatus.BAD_REQUEST) {
      const errorResponse: any = {
        errorsMessages: [],
      };
      const { message }: any = exception.getResponse();

      if (Array.isArray(message)) {
        message.forEach((m: ErrorsMessageType) =>
          errorResponse.errorsMessages.push(m),
        );
      } else {
        errorResponse.errorsMessages.push({ message });
      }

      response.status(status).send(errorResponse);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        error: exception.message,
        path: request.url,
      });
    }
  }
}

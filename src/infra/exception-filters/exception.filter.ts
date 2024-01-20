import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  GoneException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

type errorsMessages = {
  errorsMessages: string[];
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
      response.status(500).send('occured some problems');
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
        message.forEach((m: string) => errorResponse.errorsMessages.push(m));
      } else {
        errorResponse.errorsMessages.push({ message });
      }

      response.status(status).json(errorResponse);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}

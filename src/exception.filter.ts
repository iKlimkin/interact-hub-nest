import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  GoneException,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(GoneException)
export class ErrorsExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    console.log({response});
    
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

    if (status === 400) {
      let errorResponse: { errors: string[] } = {
        errors: [],
      };

      const responseBody: any = exception.getResponse();

      responseBody.message.forEach((m: string) => errorResponse.errors.push(m));

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

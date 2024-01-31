import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { ApiRequestCounterService } from '../logging/api-request-counter.service';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(
    private readonly apiRequestCounterService: ApiRequestCounterService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const { ip } = request;
    const url = request.originalUrl;
    const timestamp = new Date();

    await this.apiRequestCounterService.addClientRequest({
      ip,
      url,
      timestamp,
    });

    const duration = 10000;
    const limitTime = new Date(timestamp.getTime() - duration);

    const requestCount = await this.apiRequestCounterService.apiClientCounter({
      ip,
      url,
      limitTime,
    });
    const requestLogger =
      await this.apiRequestCounterService.getClientRequstLogger();
    console.log({ requestCount });

    if (requestCount <= 5) return next.handle();

    const result = {
      requestInfo: [
        {
          ip: requestLogger[0].ip,
          url: requestLogger[0].url,
        },
      ],
    };

    response.status(HttpStatus.TOO_MANY_REQUESTS).send(result);
    return new Observable();
  }
}

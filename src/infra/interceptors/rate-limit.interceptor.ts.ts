import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { ApiRequestCounterService } from '../logging/application/api-request-counter.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(
    private readonly apiRequestCounterService: ApiRequestCounterService,
    private configService: ConfigService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const db = this.configService.get('MAIN_DB', { infer: true });

    const { ip } = request;
    const url = request.originalUrl;
    const timestamp = new Date();

    await this.apiRequestCounterService.addClientRequest({
      ip,
      url,
      timestamp,
    });

    const duration = 10000;
    const timeLimit = new Date(timestamp.getTime() - duration);

    const requestCount = await this.apiRequestCounterService.apiClientCounter({
      ip,
      url,
      timeLimit,
    });

    if (requestCount <= 5) return next.handle();

    const requestLogger =
      await this.apiRequestCounterService.getClientRequestLogger();

    const responseInfo = {
      requestInfo: [
        {
          ip: requestLogger[0].ip,
          url: requestLogger[0].url,
        },
      ],
    };

    response.status(HttpStatus.TOO_MANY_REQUESTS).send(responseInfo);
    return new Observable();
  }
}

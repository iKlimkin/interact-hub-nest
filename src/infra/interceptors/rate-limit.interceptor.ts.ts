import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ApiRequestCounterService } from '../application/api-request-counter.service';

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
    console.log({requestCount});
    
    if (requestCount <= 5) {
      return next
        .handle()
        .pipe(tap(() => console.log('Request processed successfully')));
    } else {
      response.status(HttpStatus.TOO_MANY_REQUESTS).send('Rate limit exceeded');
      return new Observable();
    }
  }
}

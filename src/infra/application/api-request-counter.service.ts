import { Injectable } from '@nestjs/common';
import {
  MatchApiType,
  MatchApiLimitType,
} from '../interceptors/models/rate-limiter.models';
import { ApiRequestCounterRepository } from '../repositories/api-request-counter.repository';

@Injectable()
export class ApiRequestCounterService {
  constructor(
    private apiRequestCounterRepository: ApiRequestCounterRepository,
  ) {}
  async addClientRequest(inputData: MatchApiType): Promise<boolean> {
    return this.apiRequestCounterRepository.addClientRequest(inputData);
  }

  async apiClientCounter(inputData: MatchApiLimitType): Promise<number> {
    return this.apiRequestCounterRepository.apiClientCounter(inputData);
  }
}

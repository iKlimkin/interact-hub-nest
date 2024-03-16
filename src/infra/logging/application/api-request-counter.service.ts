import { Injectable } from '@nestjs/common';
import {
  MatchApiLimitType,
  MatchApiType,
} from '../api/models/rate-limiter.models';
import { ApiRequestCounterRepository } from '../infra/api-request-counter.repository';
import { ApiRequestCounterSQLRepository } from '../infra/api-request-counter.sql-repository';

@Injectable()
export class ApiRequestCounterService {
  constructor(
    private apiRequestCounterRepository: ApiRequestCounterRepository,
    private apiRequestCounterSQLRepository: ApiRequestCounterSQLRepository,
  ) {}
  async addClientRequest(inputData: MatchApiType): Promise<boolean> {
    return this.apiRequestCounterRepository.addClientRequest(inputData);
  }

  async apiClientCounter(inputData: MatchApiLimitType): Promise<number> {
    return this.apiRequestCounterRepository.apiClientCounter(inputData);
  }

  async getClientRequestLogger(): Promise<MatchApiType[]> {
    return this.apiRequestCounterRepository.getClientRequestsCollection();
  }

  async addApiRequestSql(inputData: MatchApiType): Promise<boolean> {
    return this.apiRequestCounterSQLRepository.addApiRequestSql(inputData);
  }

  async apiRequestCounterSql(
    inputData: MatchApiLimitType,
  ): Promise<{ count: number }> {
    return this.apiRequestCounterSQLRepository.apiRequestCounterSql(inputData);
  }

  async getApiRequestLoggerSql(): Promise<MatchApiType[]> {
    return this.apiRequestCounterSQLRepository.getApiRequestLoggerSql();
  }
}

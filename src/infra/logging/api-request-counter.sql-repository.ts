import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MatchApiLimitType, MatchApiType } from './models/rate-limiter.models';

@Injectable()
export class ApiRequestCounterSQLRepository {
  constructor(private dataSource: DataSource) {}

  async addApiRequestSql(inputData: MatchApiType): Promise<boolean> {
    try {
      const { ip, url } = inputData;
      const query = `
        INSERT INTO api_requests (ip, url)
        VALUES ($1, $2)
      `;

      const result = await this.dataSource.query(query, [ip, url]);

      return !!result;
    } catch (error) {
      console.error(
        `Occurred some problems during count client's api requests ${error}`,
      );
      return false;
    }
  }

  async apiRequestCounterSql(
    inputData: MatchApiLimitType,
  ): Promise<{ count: number }> {
    const { ip, timeLimit } = inputData;
    try {
      const query = `
        SELECT COUNT(*)
        FROM api_requests
        WHERE ip = $1 AND timestamp >= $2
        `;
      const [count] = await this.dataSource.query(query, [ip, timeLimit]);

      return count;
    } catch (error) {
      console.error(
        `Occurred some problems during add client's api requests ${error}`,
      );
      return { count: 0 };
    }
  }

  async getApiRequestLoggerSql(): Promise<MatchApiType[]> {
    try {
      return this.dataSource.query(`
            SELECT *
            FROM api_requests
          `);
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails request loggers operate',
        error,
      );
    }
  }
}

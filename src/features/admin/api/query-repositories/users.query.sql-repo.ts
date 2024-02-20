import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PaginationViewModel } from '../../../../domain/sorting-base-filter';
import { getPagination } from '../../../../infra/utils/pagination';
import { SAQueryFilter } from '../models/outputSA.models.ts/users-admin-query.filter';
import { getSAViewSQLModel } from '../models/userAdmin.view.models/saView.model';
import { SAViewModel } from '../models/userAdmin.view.models/userAdmin.view.model';

@Injectable()
export class UsersSqlQueryRepository {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async getAllUsers(
    queryOptions: SAQueryFilter,
  ): Promise<PaginationViewModel<SAViewModel>> {
    const { searchEmailTerm, searchLoginTerm } = queryOptions;

    const { pageNumber, pageSize, skip, sortBy, sortDirection } = getPagination(
      queryOptions,
      false,
      !0,
    );

    const searchTerms = [
      `%${searchLoginTerm ? searchLoginTerm : ''}%`,
      `%${searchEmailTerm ? searchEmailTerm : ''}%`,
    ];

    const query = `
    SELECT *
      FROM user_accounts
      WHERE login ILIKE $1 OR email ILIKE $2
      ORDER BY ${sortBy} ${sortDirection}
      LIMIT $3 OFFSET $4
    `;

    const result = await this.dataSource.query(query, [
      ...searchTerms,
      pageSize,
      skip,
    ]);

    const [countResult] = await this.dataSource.query(
      `
      SELECT COUNT(*)
      FROM user_accounts
      WHERE login ILIKE $1 OR email ILIKE $2
    `,
      searchTerms,
    );

    const userSAViewModel = new PaginationViewModel<SAViewModel>(
      result.map(getSAViewSQLModel),
      pageNumber,
      pageSize,
      countResult.count,
    );

    return userSAViewModel;
  }
  catch(error) {
    throw new InternalServerErrorException(
      'Database fails operate with find users by sorting model',
      error,
    );
  }

  async getUserById(userId: string): Promise<SAViewModel | null> {
    try {
      const result = await this.dataSource.query(
        `
        SELECT id, login, email, created_at
        FROM user_accounts
        WHERE id = $1
      `,
        [userId],
      );

      if (!result) return null;

      return getSAViewSQLModel(result[0]);
    } catch (error) {
      console.error('Database fails operate with find user', error);
      return null;
    }
  }
}

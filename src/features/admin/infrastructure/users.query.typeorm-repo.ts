import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAccount } from '../domain/entities/user-account.entity';
import { SAViewModel } from '../api/models/userAdmin.view.models/userAdmin.view.model';
import { getSAViewSQLModel } from '../api/models/userAdmin.view.models/saView.model';
import { getPagination } from '../../../infra/utils/pagination';
import { SAQueryFilter } from '../api/models/outputSA.models.ts/users-admin-query.filter';
import { PaginationViewModel } from '../../../domain/sorting-base-filter';

@Injectable()
export class UsersQueryRepo {
  constructor(
    @InjectRepository(UserAccount)
    private readonly userAccounts: Repository<UserAccount>,
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
    const queryBuilder = this.userAccounts.createQueryBuilder('user_accounts');

    queryBuilder
      .where(
        'user_accounts.login ILIKE :login OR user_accounts.email ILIKE :email',
        { login: searchTerms[0], email: searchTerms[1] },
      )
      .orderBy(
        sortBy !== 'created_at'
          ? `user_accounts.${sortBy} COLLATE "C"`
          : 'user_accounts.created_at',
        sortDirection,
      )
      .skip(skip)
      .take(pageSize);

    const result = await queryBuilder.getMany();
    const count = await queryBuilder.getCount();

    const userSAViewModel = new PaginationViewModel<SAViewModel>(
      result.map(getSAViewSQLModel),
      pageNumber,
      pageSize,
      count,
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
      const result = await this.userAccounts.findOneBy({ id: userId });

      if (!result) return null;

      return getSAViewSQLModel(result);
    } catch (error) {
      console.error('Database fails operate with find user', error);
      return null;
    }
  }
}

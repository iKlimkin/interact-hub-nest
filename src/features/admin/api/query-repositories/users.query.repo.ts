import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { getPagination } from '../../../../infra/utils/pagination';
import { getSearchTerm } from '../../../../infra/utils/search-term-finder';
import {
  UserAccount,
  UserAccountModelType,
} from '../../domain/entities/userAccount.schema';
import { SAQueryFilter } from '../models/outputSA.models.ts/users-admin-query.filter';
import { SAViewModel } from '../models/userAdmin.view.models/userAdmin.view.model';
import {
  PaginationFilter,
  PaginationViewModel,
} from '../../../../domain/sorting-base-filter';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(UserAccount.name)
    private UserAccountModel: UserAccountModelType,
  ) {}

  async getAllUsers(
    inputData: SAQueryFilter,
  ): Promise<PaginationViewModel<SAViewModel>> {
    const { searchEmailTerm, searchLoginTerm, ...sortProps } = inputData;

    const queryProps = [searchEmailTerm, searchLoginTerm];

    // const paginationFilter = new PaginationFilter(sortProps, queryProps);

    // paginationFilter.sortDirection;

    const filter = getSearchTerm(
      {
        searchEmailTerm: inputData.searchEmailTerm,
        searchLoginTerm: inputData.searchLoginTerm,
      },
      !0,
    );

    const { pageNumber, pageSize, skip, sort } = await getPagination(
      inputData,
      !0,
    );

    try {
      const users = await this.UserAccountModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(pageSize);

      const totalCount = await this.UserAccountModel.countDocuments(filter);

      const userSAModel = new this.UserAccountModel();

      const userSAViewModel = new PaginationViewModel(
        users.map(userSAModel.getSAViewModel),
        pageNumber,
        pageSize,
        totalCount,
      );

      return userSAViewModel;
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate with find users by sorting model',
        error,
      );
    }
  }

  async getUserById(userId: string): Promise<SAViewModel | null> {
    try {
      const user = await this.UserAccountModel.findById(userId);

      // const result = await this.dataSource.query(`
      //   SELECT *
      //   FROM user_accounts
      //   WHERE "id" = $1
      // `, [userId])


      if (!user) return null;

      return user.getSAViewModel(user);
    } catch (error) {
      console.error('Database fails operate with find adminUser', error);
      return null;
    }
  }
}

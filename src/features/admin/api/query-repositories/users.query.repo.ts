import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  UserAccount,
  UserAccountModelType,
} from '../../domain/entities/userAccount.schema';
import { SAViewModel } from '../models/userAdmin.view.models/userAdmin.view.model';
import { SortingQueryModel } from '../../../../domain/sorting-base-filter';
import { PaginationViewModel } from '../../../../domain/pagination-view.model';
import { getPagination } from '../../../../infra/utils/pagination';
import { getSearchTerm } from '../../../../infra/utils/search-term-finder';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(UserAccount.name)
    private UserAccountModel: UserAccountModelType,
  ) {}

  async getAllUsers(
    inputData: SortingQueryModel,
  ): Promise<PaginationViewModel<SAViewModel>> {
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
        .limit(pageSize)
        .lean();

      const totalCount = await this.UserAccountModel.countDocuments(filter);
      const pagesCount = Math.ceil(totalCount / pageSize);

      const userModel = new this.UserAccountModel();

      return {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount,
        items: users.map(userModel.getSAViewModel),
      };
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

      if (!user) return null;

      return user.getSAViewModel(user);
    } catch (error) {
      console.error('Database fails operate with find adminUser', error);
      return null;
    }
  }
}

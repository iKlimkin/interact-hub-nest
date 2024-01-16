import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SortingQueryModel } from 'src/infra/SortingQueryModel';
import { PaginationViewModel } from 'src/infra/paginationViewModel';
import { getPagination } from 'src/infra/utils/pagination';
import { getSearchTerm } from 'src/infra/utils/searchTerm';
import {
  UserAccount,
  UserAccountModelType,
} from '../../domain/entities/userAccount.schema';
import { getUserViewModel } from '../models/userAdmin.view.models/getUserAdmin.view.model';
import { UserViewModel } from '../models/userAdmin.view.models/userAdmin.view.model';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(UserAccount.name)
    private UserAccountModel: UserAccountModelType,
  ) {}

  async getAllUsers(
    inputData: SortingQueryModel,
  ): Promise<PaginationViewModel<UserViewModel>> {
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
      const pagesCount = Math.ceil(totalCount / pageSize);

      return {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount,
        items: users.map(getUserViewModel),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate with find users by sorting model',
        error,
      );
    }
  }

  async getUserById(userId: string): Promise<UserViewModel | null> {
    try {
      const user = await this.UserAccountModel.findById(userId);

      if (!user) return null;

      return getUserViewModel(user);
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate with find user',
        error,
      );
    }
  }
}

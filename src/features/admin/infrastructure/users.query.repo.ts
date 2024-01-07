import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SortingQueryModel } from 'src/features/general-models/SortingQueryModel';
import { PaginationViewModel } from 'src/features/general-models/paginationViewModel';
import { getPagination } from 'src/features/general-models/utils/pagination';
import { getSearchTerm } from 'src/features/general-models/utils/searchTerm';
import { getUserViewModel } from '../api/models/userAdmin.view.models/getUserAdmin.vie.model';
import { UserViewModel } from '../api/models/userAdmin.view.models/userAdmin.view.model';
import { UserAccount, UserAccountModelType } from '../userAccount.schema';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(UserAccount.name)
    private UserAccountModel: UserAccountModelType,
  ) {}

  async getAllUsers(
    inputData: SortingQueryModel,
  ): Promise<PaginationViewModel<UserViewModel>> {
    const {
      searchEmailTerm,
      searchLoginTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    } = inputData;

    const filter = getSearchTerm({ searchEmailTerm, searchLoginTerm });

    const pagination = await getPagination({
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    });

    try {
      const users = await this.UserAccountModel.find(filter)
        .sort(pagination.sort)
        .skip(pagination.skip)
        .limit(pagination.pageSize);

      const totalCount = await this.UserAccountModel.countDocuments(filter);
      const pagesCount = Math.ceil(totalCount / pagination.pageSize);

      return {
        pagesCount: pagesCount,
        page: pagination.pageNumber,
        pageSize: pagination.pageSize,
        totalCount: totalCount,
        items: users.map(getUserViewModel),
      };
    } catch (e) {
      throw new Error(`There're something problems with find user: ${e}`);
    }
  }

  async getUserById(userId: string): Promise<UserViewModel | null> {
    try {
      const user = await this.UserAccountModel.findById(userId);

      if (!user) return null;

      return getUserViewModel(user);
    } catch (e) {
      throw new Error(`There're something during find user by id: ${e}`);
    }
  }
}

import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  UserAccount,
  UserAccountModelType,
} from 'src/features/admin/domain/entities/userAccount.schema';
import { UserAccountViewModel } from '../models/auth.output.models/auth.output.models';
import { LoginOrEmailType } from '../models/auth.output.models/auth.user.types';
import { getUserAccountViewModel } from '../models/auth.output.models/getUserAccount.view.model';

@Injectable()
export class AuthQueryRepository {
  constructor(
    @InjectModel(UserAccount.name)
    private UserAccountModel: UserAccountModelType,
  ) {}
  async findByLoginOrEmail(
    inputData: LoginOrEmailType,
  ): Promise<UserAccountViewModel | null> {
    try {
      const filter = {
        $or: [
          { 'accountData.email': inputData.email || inputData.loginOrEmail },
          { 'accountData.login': inputData.login || inputData.loginOrEmail },
        ],
      };

      const foundUser = await this.UserAccountModel.findOne(filter);

      if (!foundUser) return null;

      return getUserAccountViewModel(foundUser);
    } catch (e) {
      console.error(
        `there were some problems during find user by login or email, ${e}`,
      );
      return null;
    }
  }
}

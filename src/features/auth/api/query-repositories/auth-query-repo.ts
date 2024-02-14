import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { UserAccountViewModel } from '../models/auth.output.models/auth.output.models';
import { LoginOrEmailType } from '../models/auth.output.models/auth.user.types';
import { getUserAccountViewModel } from '../models/auth.output.models/user-account.view.model';
import {
  UserAccount,
  UserAccountModelType,
} from '../../../admin/domain/entities/userAccount.schema';

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

  async findUserByRecoveryCode(
    recoveryCode: string,
  ): Promise<UserAccountViewModel | null> {
    try {
      const filter = {
        'passwordRecovery.recoveryCode': recoveryCode,
        'passwordRecovery.expirationDate': { $gt: new Date().toISOString() },
      };

      const foundUser = await this.UserAccountModel.findOne(filter);

      if (!foundUser) return null;

      return getUserAccountViewModel(foundUser);
    } catch (e) {
      console.error(
        `there were some problems during find user by confirmation code, ${e}`,
      );
      return null;
    }
  }

  async getUserById(userId: string): Promise<UserAccountViewModel | null> {
    try {
      const user = await this.UserAccountModel.findById(userId);

      if (!user) return null;

      const userViewModel = user.getUserAccountViewModel(user);

      return userViewModel;
    } catch (error) {
      console.error('Database fails operate with find adminUser', error);
      return null;
    }
  }
}

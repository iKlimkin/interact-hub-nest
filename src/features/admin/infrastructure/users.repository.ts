import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  UserAccount,
  UserAccountDocument,
  UserAccountModelType,
} from '../domain/entities/userAccount.schema';
import { UserAccountDBType } from '../../auth/api/models/auth.output.models/auth.output.models';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(UserAccount.name)
    private UserAccountModel: UserAccountModelType,
  ) {}
  async save(
    userAdminModel: UserAccountDocument,
  ): Promise<UserAccountDocument> {
    try {
      const createdUserAdmin = await userAdminModel.save();

      return createdUserAdmin;
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate with create user',
        error,
      );
    }
  }

  async getUserById(userId: string): Promise<UserAccountDBType | null> {
    try {
      const foundUser = await this.UserAccountModel.findOne({ _id: userId});

      if (!foundUser) return null;

      return foundUser
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate with fiind user',
        error,
      );
    }
  }

  async deleteUser(searchId: string): Promise<boolean> {
    try {
      return this.UserAccountModel.findByIdAndDelete(searchId).lean();
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate with delete user',
        error,
      );
    }
  }
}

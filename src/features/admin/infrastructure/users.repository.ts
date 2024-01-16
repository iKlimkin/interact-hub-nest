import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  UserAccount,
  UserAccountDocument,
  UserAccountModelType,
} from '../domain/entities/userAccount.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
  UserAccountType,
  UserAccountDBType,
} from 'src/features/auth/api/models/auth.output.models/auth.output.models';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(UserAccount.name)
    private UserAccountModel: UserAccountModelType,
  ) {}

  // async create(
  //   userAdminDto: Readonly<UserAccountType>,
  // ): Promise<UserAccountDocument> {
  //   try {
  //     const createdUserAdmin = await this.UserAccountModel.create(userAdminDto);

  //     return createdUserAdmin;
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Database fails operate with create user',
  //       error,
  //     );
  //   }
  // }

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
      const foundUser = await this.UserAccountModel.findById(userId);

      if (!foundUser) return null;

      return {
        ...foundUser,
      };
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

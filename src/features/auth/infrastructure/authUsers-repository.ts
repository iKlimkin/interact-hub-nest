import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WithId } from 'mongodb';
import { OutputId } from '../../../domain/likes.types';
import {
  UserAccount,
  UserAccountDocument,
  UserAccountModelType,
} from '../../admin/domain/entities/userAccount.schema';
import { PasswordRecoveryType } from '../api/models/auth-input.models.ts/input-password-rec.type';
import {
  UserAccountType,
  UserRecoveryType,
} from '../api/models/auth.output.models/auth.output.models';
import { LoginOrEmailType } from '../api/models/auth.output.models/auth.user.types';
import { TemporaryAccountDBType } from '../api/models/temp-account.models.ts/temp-account-models';
import {
  TempUserAccount,
  TempUserAccountModelType,
} from '../domain/entities/temp-account.schema';

type PasswordsType = {
  passwordHash: string;
  passwordSalt: string;
};

@Injectable()
export class AuthUsersRepository {
  constructor(
    @InjectModel(UserAccount.name)
    private UserAccountModel: UserAccountModelType,
    @InjectModel(TempUserAccount.name)
    private TempUserAccountModel: TempUserAccountModelType,
  ) {}

  async save(smartUser: UserAccountDocument): Promise<UserAccountDocument> {
    try {
      return await smartUser.save();
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate with create user',
        error,
      );
    }
  }

  async createTemporaryUserAccount(
    inputData: UserRecoveryType,
    email: string,
  ): Promise<OutputId> {
    try {
      const { recoveryCode, expirationDate } = inputData;

      const insertedTempUser = new this.TempUserAccountModel({
        email,
        recoveryCode,
        expirationDate,
      });

      await insertedTempUser.save();

      return {
        id: insertedTempUser._id.toString(),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `While creating the user occured some errors: ${error}`,
      );
    }
  }

  async findTemporaryUserAccountByCode(
    recoveryCode: string,
  ): Promise<TemporaryAccountDBType | null> {
    try {
      const foundTempUserAccountModel = await this.TempUserAccountModel.findOne(
        {
          recoveryCode,
        },
      );

      if (!foundTempUserAccountModel) return null;

      return foundTempUserAccountModel;
    } catch (error) {
      console.error(`While find the user occured some errors: ${error}`);
      return null;
    }
  }

  async findUserById(userId: string): Promise<UserAccountDocument | null> {
    try {
      const foundSmartUser = await this.UserAccountModel.findById(userId);

      if (!foundSmartUser) return null;

      return foundSmartUser;
    } catch (error) {
      console.error(`While find the user occured some errors: ${error}`);
      return null;
    }
  }

  async deleteTemporaryUserAccount(recoveryCode: string): Promise<boolean> {
    try {
      const tmpAccount = await this.TempUserAccountModel.deleteOne({
        recoveryCode,
      });

      return tmpAccount.deletedCount === 1;
    } catch (error) {
      console.error('Database fails operate with deleting user', error);
      return false;
    }
  }

  async findUserByConfirmationCode(
    emailConfirmationCode: string,
  ): Promise<UserAccountDocument | null> {
    try {
      const filter = {
        'emailConfirmation.confirmationCode': emailConfirmationCode,
        'emailConfirmation.expirationDate': { $gt: new Date().toISOString() },
      };

      const foundSmartUser = await this.UserAccountModel.findOne(filter);

      if (!foundSmartUser) return null;

      return foundSmartUser;
    } catch (e) {
      console.error(
        `there were some problems during find user by confirmation code, ${e}`,
      );
      return null;
    }
  }

  async findByLoginOrEmail(
    inputData: LoginOrEmailType,
  ): Promise<WithId<UserAccountType> | null> {
    try {
      const foundUser = await this.UserAccountModel.findOne({
        $or: [
          { 'accountData.email': inputData.email || inputData.loginOrEmail },
          { 'accountData.login': inputData.login || inputData.loginOrEmail },
        ],
      });

      if (!foundUser) return null;

      return {
        _id: foundUser._id,
        accountData: foundUser.accountData,
        emailConfirmation: foundUser.emailConfirmation,
        passwordRecovery: foundUser.passwordRecovery,
      };
    } catch (e) {
      console.error(
        `there were some problems during find user by login or email, ${e}`,
      );
      return null;
    }
  }

  async findByEmail(email: string): Promise<UserAccountType | null> {
    try {
      const foundUser = await this.UserAccountModel.findOne({
        'accountData.email': email,
      });

      if (!foundUser) return null;

      return foundUser;
    } catch (e) {
      console.error(`there were some problems during find user by email, ${e}`);
      return null;
    }
  }

  async updateConfirmation(id: string): Promise<boolean> {
    try {
      const confirmedUser = await this.UserAccountModel.findByIdAndUpdate(id, {
        $set: { 'emailConfirmation.isConfirmed': true },
      });

      return !!confirmedUser;
    } catch (error) {
      console.error(
        `there were some problems during update user's confirmation by id: ${error}`,
      );
      return false;
    }
  }

  async updateConfirmationCode(
    email: string,
    confirmationCode: string,
  ): Promise<boolean> {
    try {
      const confirmedUser = await this.UserAccountModel.updateOne(
        { 'accountData.email': email },
        { $set: { 'emailConfirmation.confirmationCode': confirmationCode } },
      );

      return confirmedUser.modifiedCount === 1;
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate during update confirmation code operation',
      );
    }
  }

  async updateRecoveryCode(
    email: string,
    recoveryData: UserRecoveryType,
  ): Promise<boolean> {
    try {
      const filter = { 'accountData.email': email };
      const update = {
        $set: {
          'passwordRecovery.recoveryCode': recoveryData.recoveryCode,
          'passwordRecovery.expirationDate': recoveryData.expirationDate,
        },
      };

      const recoveredPass = await this.UserAccountModel.updateOne(
        filter,
        update,
      );

      return recoveredPass.modifiedCount === 1;
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate during update recovery code operation',
      );
    }
  }

  async findUserByRecoveryCode(
    recoveryCode: string,
  ): Promise<UserAccountDocument | null> {
    try {
      const filter = {
        'passwordRecovery.recoveryCode': recoveryCode,
        'passwordRecovery.expirationDate': { $gt: new Date().toISOString() },
      };

      const foundUser = await this.UserAccountModel.findOne(filter);

      if (!foundUser) return null;

      return foundUser;
    } catch (e) {
      console.error(
        `there were some problems during find user by confirmation code, ${e}`,
      );
      return null;
    }
  }

  async updateUserPassword(
    inputData: Pick<PasswordRecoveryType, 'recoveryCode'> & PasswordsType,
  ): Promise<boolean> {
    try {
      const filter = {
        'passwordRecovery.recoveryCode': inputData.recoveryCode,
      };
      const update = {
        $set: {
          'accountData.passwordSalt': inputData.passwordSalt,
          'accountData.passwordHash': inputData.passwordHash,
          'passwordRecovery.recoveryCode': null,
        },
      };

      const updatedPasswordData = await this.UserAccountModel.updateOne(
        filter,
        update,
      );

      return updatedPasswordData.modifiedCount === 1;
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate with update user password',
        error,
      );
    }
  }

  async updateUserCredentials(
    email: string,
    confirmationCode: string,
  ): Promise<boolean> {
    try {
      const confirmedUser = await this.UserAccountModel.updateOne(
        { 'accountData.email': email },
        { $set: { 'emailConfirmation.confirmationCode': confirmationCode } },
      );

      return confirmedUser.modifiedCount === 1;
    } catch (error) {
      console.error(
        `there were some problems during update user's confirmation by new confirmation code: ${error}`,
      );
      return false;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await this.UserAccountModel.findByIdAndDelete(id);

      return !!result;
    } catch (error) {
      console.error(`there were some problems during removal user, ${error}`);
      return false;
    }
  }
}

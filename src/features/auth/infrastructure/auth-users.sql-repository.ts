import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OutputId } from '../../../domain/likes.types';
import { UserAccountDocument } from '../../admin/domain/entities/userAccount.schema';
import { PasswordRecoveryType } from '../api/models/auth-input.models.ts/input-password-rec.type';
import {
  UserRecoveryType,
  UsersResponseModel,
} from '../api/models/auth.output.models/auth.output.models';
import { LoginOrEmailType } from '../api/models/auth.output.models/auth.user.types';
import { TemporaryAccountDBType } from '../api/models/temp-account.models.ts/temp-account-models';

type PasswordsType = {
  passwordHash: string;
  passwordSalt: string;
};

@Injectable()
export class AuthUsersSqlRepository {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async createTemporaryUserAccount(
    inputData: UserRecoveryType,
    email: string,
  ): Promise<OutputId | null> {
    try {
      const { recoveryCode, expirationDate } = inputData;

      const insertQuery = `
        INSERT INTO temporary_user_accounts (email, recovery_code, code_expiration_time)
        VALUES ($1, $2, $3)
        RETURNING id
      `;

      const result = await this.dataSource.query(insertQuery, [
        email,
        recoveryCode,
        expirationDate,
      ]);
      console.log({ result });

      return result[0];
    } catch (error) {
      console.error(`While creating the user occurred some errors: ${error}`);
      return null;
    }
  }

  async findTemporaryAccountByRecoveryCode(
    recoveryCode: string,
  ): Promise<TemporaryAccountDBType | null> {
    try {
      const findQuery = `
        SELECT *
        FROM temporary_user_accounts
        WHERE recovery_code = $1
      `;
      const result = await this.dataSource.query(findQuery, [recoveryCode]);

      if (!result) return null;

      return result[0];
    } catch (error) {
      console.error(
        `While find the temporary account occurred some errors: ${error}`,
      );
      return null;
    }
  }

  // async findUserById(userId: string): Promise<UserAccountDocument | null> {
  //   try {
  //     const foundSmartUser = await this.UserAccountModel.findById(userId);

  //     if (!foundSmartUser) return null;

  //     return foundSmartUser;
  //   } catch (error) {
  //     console.error(`While find the user occured some errors: ${error}`);
  //     return null;
  //   }
  // }

  async deleteTemporaryUserAccount(recoveryCode: string): Promise<boolean> {
    try {
      const deleteQuery = `
        DELETE
        FROM temporary_user_accounts
        WHERE recovery_code = $1
      `;
      const result = await this.dataSource.query(deleteQuery, [recoveryCode]);

      return result[1] > 0;
    } catch (error) {
      console.error('Database fails operate with deleting user', error);
      return false;
    }
  }

  async findUserAccountByConfirmationCode(
    confirmationCode: string,
  ): Promise<UsersResponseModel | null> {
    try {
      const currentTime = new Date().toISOString();

      const filterQuery = `
        SELECT *
        FROM user_accounts
        WHERE
          confirmation_code = $1
          AND confirmation_expiration_date > $2;
      `;

      const result = await this.dataSource.query(filterQuery, [
        confirmationCode,
        currentTime,
      ]);

      if (!result.length) return null;

      return result[0];
    } catch (e) {
      console.error(
        `there were some problems during find user's account by confirmation code, ${e}`,
      );
      return null;
    }
  }

  async findByLoginOrEmail(
    inputData: LoginOrEmailType,
  ): Promise<UsersResponseModel | null> {
    try {
      const { email, login, loginOrEmail } = inputData;

      const query = `
        SELECT *
        FROM user_accounts
        WHERE email LIKE $1 OR email LIKE $3 OR login LIKE $2 OR login LIKE $3
      `;
      const result = await this.dataSource.query<UsersResponseModel>(query, [
        email,
        login,
        loginOrEmail,
      ]);

      if (!result) return null;

      return result[0];
    } catch (e) {
      console.error(
        `there were some problems during find user by login or email, ${e}`,
      );
      return null;
    }
  }

  // async findByEmail(email: string): Promise<UserAccountType | null> {
  //   try {
  //     const foundUser = await this.UserAccountModel.findOne({
  //       'accountData.email': email,
  //     });

  //     if (!foundUser) return null;

  //     return foundUser;
  //   } catch (e) {
  //     console.error(`there were some problems during find user by email, ${e}`);
  //     return null;
  //   }
  // }

  async updateConfirmation(id: string): Promise<boolean> {
    try {
      const updateQuery = `
        UPDATE user_accounts
        SET
          is_confirmed = true
          WHERE id = $1
      `;

      const result = await this.dataSource.query(updateQuery, [id]);

      return result[1] > 0;
    } catch (error) {
      console.error(
        `there were some problems during update user's confirmation code: ${error}`,
      );
      return false;
    }
  }

  async updateConfirmationCode(
    email: string,
    confirmationCode: string,
  ): Promise<boolean> {
    try {
      const updateQuery = `
      UPDATE user_accounts
      SET
        confirmation_code = $1
        WHERE email = $2
      `;
      const result = await this.dataSource.query(updateQuery, [
        confirmationCode,
        email,
      ]);

      return result[1] > 0;
    } catch (error) {
      console.error(
        `Database fails operate during update confirmation code operation ${error}`,
      );
      return false;
    }
  }

  async updateRecoveryCode(
    email: string,
    recoveryData: UserRecoveryType,
  ): Promise<boolean> {
    try {
      const updateQuery = `
        UPDATE user_accounts
        SET
          password_recovery_code = $1,
          password_recovery_expiration = $2
        WHERE email = $3
      `;

      const result = await this.dataSource.query(updateQuery, [
        recoveryData.recoveryCode,
        recoveryData.expirationDate,
        email,
      ]);

      return result[1] > 0;
    } catch (error) {
      console.error(
        `Database fails operate during update recovery code operation ${error}`,
      );
      return false;
    }
  }

  async findUserAccountByRecoveryCode(
    recoveryCode: string,
  ): Promise<UsersResponseModel | null> {
    try {
      const currentTime = new Date().toISOString();

      const filterQuery = `
        SELECT *
        FROM user_accounts
        WHERE
          password_recovery_code = $1
          AND password_recovery_expiration > $2;
      `;

      const result = await this.dataSource.query<UsersResponseModel>(
        filterQuery,
        [recoveryCode, currentTime],
      );

      if (!result) return null;

      return result[0];
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
      const updateQuery = `
      UPDATE user_accounts
      SET
        password_recovery_code = null,
        password_salt = $1,
        password_hash = $2
      WHERE password_recovery_code = $3
      `;

      const result = await this.dataSource.query(
        updateQuery,
        Object.values(inputData),
      );

      return result[1] > 0;
    } catch (error) {
      console.error(
        `Database fails operate with update user password ${error}`,
      );
      return false;
    }
  }

  // async updateUserCredentials(
  //   email: string,
  //   confirmationCode: string,
  // ): Promise<boolean> {
  //   try {
  //     const confirmedUser = await this.UserAccountModel.updateOne(
  //       { 'accountData.email': email },
  //       { $set: { 'emailConfirmation.confirmationCode': confirmationCode } },
  //     );

  //     return confirmedUser.modifiedCount === 1;
  //   } catch (error) {
  //     console.error(
  //       `there were some problems during update user's confirmation by new confirmation code: ${error}`,
  //     );
  //     return false;
  //   }
  // }
}

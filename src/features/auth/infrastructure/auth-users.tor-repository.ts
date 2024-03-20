import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Like,
  Repository,
  FindOptions,
  FindOptionsWhere,
  MoreThan,
} from 'typeorm';
import { OutputId } from '../../../domain/likes.types';
import { PasswordRecoveryType } from '../api/models/auth-input.models.ts/input-password-rec.type';
import { UserRecoveryType } from '../api/models/auth.output.models/auth.output.models';
import { LoginOrEmailType } from '../api/models/auth.output.models/auth.user.types';
import { TemporaryAccountDBType } from '../api/models/temp-account.models.ts/temp-account-models';
import { UsersResponseModel } from '../api/models/auth.output.models/auth-sql.output.models';
import { UserAccount } from '../../admin/domain/entities/user-account.entity';
import { TemporaryUserAccount } from '../domain/entities/temp-account.entity';

type PasswordsType = {
  passwordHash: string;
  passwordSalt: string;
};

@Injectable()
export class AuthUsersTORRepository {
  constructor(
    @InjectRepository(UserAccount)
    private readonly userAccounts: Repository<UserAccount>,
    @InjectRepository(TemporaryUserAccount)
    private readonly tempUserAccounts: Repository<TemporaryUserAccount>,
  ) {}

  async createTemporaryUserAccount(
    inputData: UserRecoveryType,
    email: string,
  ): Promise<OutputId | null> {
    try {
      const { recoveryCode, expirationDate } = inputData;

      const result = await this.tempUserAccounts.insert({
        email: email,
        recovery_code: recoveryCode,
        code_expiration_time: expirationDate,
      });

      return result.raw[0].id;
    } catch (error) {
      console.error(
        `While creating the temp user account occurred some errors: ${error}`,
      );
      return null;
    }
  }

  async findTemporaryAccountByRecoveryCode(
    recoveryCode: string,
  ): Promise<TemporaryAccountDBType | TemporaryUserAccount | null> {
    try {
      const result = await this.tempUserAccounts.findOneBy({
        recovery_code: recoveryCode,
      });

      if (!result) return null;

      return result;
    } catch (error) {
      console.error(
        `While find the temporary account occurred some errors: ${error}`,
      );
      return null;
    }
  }

  // async findUserAccountById(
  //   userId: string,
  // ): Promise<UsersResponseModel | null> {
  //   try {
  //     const findQuery = `
  //       SELECT *
  //       FROM user_accounts
  //       WHERE id = $1
  //     `;
  //     const result = await this.dataSource.query<UsersResponseModel[]>(
  //       findQuery,
  //       [userId],
  //     );

  //     if (!result) return null;

  //     return result[0];
  //   } catch (error) {
  //     console.error(`While find the user occurred some errors: ${error}`);
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
      const result = await this.tempUserAccounts.delete({
        recovery_code: recoveryCode,
      });

      return result.affected !== 0;
    } catch (error) {
      console.error('Database fails operate with deleting user', error);
      return false;
    }
  }

  async findUserAccountByConfirmationCode(
    confirmationCode: string,
  ): Promise<UsersResponseModel | UserAccount | null> {
    try {
      const currentTime = new Date();

      const result = await this.userAccounts.findOneBy({
        confirmation_code: confirmationCode,
        confirmation_expiration_date: MoreThan(currentTime),
      });

      if (!result) return null;

      return result;
    } catch (e) {
      console.error(
        `there were some problems during find user's account by confirmation code, ${e}`,
      );
      return null;
    }
  }

  async findByLoginOrEmail(
    inputData: LoginOrEmailType,
  ): Promise<UserAccount | null> {
    try {
      const { email, login, loginOrEmail } = inputData;

      const conditions: FindOptionsWhere<UserAccount>[] = [
        { email: Like('' + email) },
        { login: Like('' + login) },
        { email: Like('' + loginOrEmail) },
        { login: Like('' + loginOrEmail) },
      ];

      const result = await this.userAccounts.findOne({ where: conditions });

      if (!result) return null;

      return result;
    } catch (e) {
      console.error(
        `there were some problems during find user by login or email, ${e}`,
      );
      return null;
    }
  }

  async updateConfirmation(id: string): Promise<boolean> {
    try {
      const result = await this.userAccounts.update(
        { id },
        { is_confirmed: true },
      );

      return result.affected !== 0;
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
    newConfirmationExpDate: Date,
  ): Promise<boolean> {
    try {
      const result = await this.userAccounts.update(
        { email },
        {
          confirmation_code: confirmationCode,
          confirmation_expiration_date: newConfirmationExpDate,
        },
      );

      return result.affected !== 0;
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
      const result = await this.userAccounts.update(
        { email: email },
        {
          password_recovery_code: recoveryData.recoveryCode,
          password_recovery_expiration_date: recoveryData.expirationDate,
        },
      );

      return result.affected !== 0;
    } catch (error) {
      console.error(
        `Database fails operate during update recovery code operation ${error}`,
      );
      return false;
    }
  }

  // async findUserAccountByRecoveryCode(
  //   recoveryCode: string,
  // ): Promise<UsersResponseModel | null> {
  //   try {
  //     const currentTime = new Date().toISOString();

  //     const filterQuery = `
  //       SELECT *
  //       FROM user_accounts
  //       WHERE
  //         password_recovery_code = $1
  //         AND password_recovery_expiration > $2;
  //     `;

  //     const result = await this.dataSource.query<UsersResponseModel>(
  //       filterQuery,
  //       [recoveryCode, currentTime],
  //     );

  //     if (!result) return null;

  //     return result[0];
  //   } catch (e) {
  //     console.error(
  //       `there were some problems during find user by confirmation code, ${e}`,
  //     );
  //     return null;
  //   }
  // }

  async updateUserPassword(
    inputData: Pick<PasswordRecoveryType, 'recoveryCode'> & PasswordsType,
  ): Promise<boolean> {
    try {
      const { passwordHash, passwordSalt, recoveryCode } = inputData;

      const result = await this.userAccounts.update(
        { password_recovery_code: recoveryCode },
        {
          password_recovery_code: '',
          password_recovery_expiration_date: '',
          password_hash: passwordHash,
          password_salt: passwordSalt,
        },
      );

      return result.affected !== 0;
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

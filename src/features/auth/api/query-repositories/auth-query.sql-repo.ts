import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserAccountViewModel, UsersResponseModel } from '../models/auth.output.models/auth.output.models';
import { LoginOrEmailType } from '../models/auth.output.models/auth.user.types';
import { getUserAccountSqlViewModel } from '../models/auth.output.models/getUserAccount.view.model';

@Injectable()
export class AuthQuerySqlRepository {
  constructor(private dataSource: DataSource) {}

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

  //   async findUserByRecoveryCode(
  //     recoveryCode: string,
  //   ): Promise<UserAccountViewModel | null> {
  //     try {
  //       const filter = {
  //         'passwordRecovery.recoveryCode': recoveryCode,
  //         'passwordRecovery.expirationDate': { $gt: new Date().toISOString() },
  //       };

  //       const foundUser = await this.UserAccountModel.findOne(filter);

  //       if (!foundUser) return null;

  //       return getUserAccountViewModel(foundUser);
  //     } catch (e) {
  //       console.error(
  //         `there were some problems during find user by confirmation code, ${e}`,
  //       );
  //       return null;
  //     }
  //   }

  async getUserById(userId: string): Promise<UserAccountViewModel | null> {
    try {
      const findQuery = `
          SELECT *
          FROM user_accounts
          WHERE id = $1
        `;
      const result = await this.dataSource.query(findQuery, [userId]);

      if (!result) return null;

      return getUserAccountSqlViewModel(result[0]);
    } catch (error) {
      console.error('Database fails operate with find user', error);
      return null;
    }
  }
}

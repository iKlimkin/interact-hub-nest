import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  UsersResponseModel,
  UsersSQLDto,
} from '../../auth/api/models/auth.output.models/auth.output.models';
import { CreateUserResultData } from '../application/user.admins.service';

@Injectable()
export class UsersSQLRepository {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async save(userDto: UsersSQLDto): Promise<CreateUserResultData | null> {
    try {
      const query = `
            INSERT INTO "user_accounts"
            ("login", "email", "password_salt", "password_hash",
            "confirmation_code", "confirmation_expiration_date", "is_confirmed")
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING "id"
            `;

      const result = await this.dataSource.query<UsersResponseModel>(
        query,
        Object.values(userDto),
      );

      return { userId: result[0].id };
    } catch (error) {
      console.error(`Database fails operate with create user${error}`);
      return null;
    }
  }

  async getUserById(userId: string): Promise<UsersResponseModel | null> {
    try {
      const query = `
          SELECT *
          FROM user_accounts
          WHERE "id" = $1
        `;

      const user = await this.dataSource.query<UsersResponseModel[]>(query, [
        userId,
      ]);

      if (!user.length) return null;

      return user[0];
    } catch (error) {
      console.error(`Database fails operate with find user ${error}`);
      return null;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const query = `
        DELETE FROM "user_accounts"
        WHERE "id" = $1
     `;

      const result = await this.dataSource.query(query, [userId]);

      return result[1] > 0;
    } catch (error) {
      console.error(`Database fails operate with delete user${error}`);
      return false;
    }
  }
}

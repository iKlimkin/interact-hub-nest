import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  UserAdminResponseDto,
  UserAdminSQLDto,
} from '../../auth/api/models/auth.output.models/auth.output.models';

@Injectable()
export class UsersSQLRepository {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async save(userAdminDto: UserAdminSQLDto): Promise<string | null> {
    try {
      const {
        login,
        email,
        passwordSalt,
        passwordHash,
        confirmationCode,
        expirationDate,
        isConfirmed,
      } = userAdminDto;

      const query = `
            INSERT INTO "user_accounts"
            ("login", "email", "password_salt", "password_hash",
            "confirmation_code", "confirmation_expiration_date", "is_confirmed")
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING "id"
            `;

      const userAdminId = await this.dataSource.query(query, [
        login,
        email,
        passwordSalt,
        passwordHash,
        confirmationCode,
        expirationDate,
        isConfirmed,
      ]);

      return userAdminId[0].id;
    } catch (error) {
      console.error(`Database fails operate with create user${error}`);
      return null;
    }
  }

  async getUserById(userId: string): Promise<UserAdminResponseDto | null> {
    try {
      const query = `
          SELECT *
          FROM user_accounts
          WHERE "id" = $1
        `;

      const user = await this.dataSource.query<UserAdminResponseDto[]>(query, [
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

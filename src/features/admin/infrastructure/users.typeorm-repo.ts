import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UsersResponseModel,
  UsersSQLDto,
} from '../../auth/api/models/auth.output.models/auth-sql.output.models';
import { UserAccount } from '../domain/entities/user-account.entity';
import { OutputId } from '../../../domain/likes.types';
import { CreateUserResultData } from '../application/user.admins.service';

@Injectable()
export class UserAccountsRepo {
  constructor(
    @InjectRepository(UserAccount)
    private readonly userAccounts: Repository<UserAccount>,
  ) {}

  async createUser(userDto: UsersSQLDto): Promise<CreateUserResultData | null> {
    try {
      const res = await this.userAccounts.save(userDto);
      
      return {
        userId: res.id,
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getUserById(userId: string): Promise<UserAccount | null> {
    try {
      const result = await this.userAccounts.findOneBy({ id: userId });

      console.log({ result });

      return result;
    } catch (error) {
      console.log(`${error}`);
      return null;
    }
  }

  async deleteUser(userId: string) {
    return this.userAccounts.delete(userId);
  }
}

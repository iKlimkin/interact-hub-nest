import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersSQLDto } from '../../auth/api/models/auth.output.models/auth-sql.output.models';
import { CreateUserResultData } from '../application/user.admins.service';
import { UserAccount } from '../domain/entities/user-account.entity';

@Injectable()
export class UserAccountsTORRepo {
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
      return this.userAccounts.findOneBy({ id: userId });
    } catch (error) {
      console.log(`${error}`);
      return null;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const result = await this.userAccounts.delete(userId);
      return result.affected !== 0;
    } catch (error) {
      console.log(`${error}`);
      return false;
    }
  }
}

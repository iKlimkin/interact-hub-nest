import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAccount } from '../domain/entities/user-account.entity';
import { SAViewModel } from '../api/models/userAdmin.view.models/userAdmin.view.model';
import { getSAViewSQLModel } from '../api/models/userAdmin.view.models/saView.model';

@Injectable()
export class UsersQueryRepo {
  constructor(
    @InjectRepository(UserAccount)
    private readonly userAccounts: Repository<UserAccount>,
  ) {}

  async getAllUsers() {
    try {
      const builder = this.userAccounts
        .createQueryBuilder('sa')
        .select(['sa.lastName'])
        .addSelect((qb) =>
          qb
            .select('COUNT(*)', 'walletCounts')
            .from('wallet', 'w')
            .where('w.ownerId = u.id'),
        );

      const sql = builder.getSql();

      return sql;
    } catch (error) {
      console.error(
        'Database fails operate with find users by sorting model',
        error,
      );
    }
  }

  async getUserById(userId: string): Promise<SAViewModel | null> {
    try {
      const result = await this.userAccounts.findOneBy({ id: userId });

      if (!result) return null;

      return getSAViewSQLModel(result);
    } catch (error) {
      console.error('Database fails operate with find user', error);
      return null;
    }
  }
}

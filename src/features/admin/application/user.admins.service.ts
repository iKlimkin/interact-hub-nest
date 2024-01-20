import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  UserAccount,
  UserAccountModelType,
  UserAccountDocument,
} from '../domain/entities/userAccount.schema';
import { UsersRepository } from '../infrastructure/users.repository';
import { BcryptAdapter } from '../../../infra/adapters/bcrypt-adapter';
import { AuthUserType } from '../../auth/api/models/auth.output.models/auth.user.types';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectModel(UserAccount.name)
    private UserAccountModel: UserAccountModelType,
    private bcryptAdapter: BcryptAdapter,
    private usersRepository: UsersRepository,
  ) {}

  async createUser(createUser: AuthUserType): Promise<UserAccountDocument> {
    const { email, login, password } = createUser;

    const { passwordSalt, passwordHash } =
      await this.bcryptAdapter.createHash(password);

    const userAdminModel = this.UserAccountModel.makeInstance({
      login,
      email,
      passwordHash,
      passwordSalt,
      isConfirmed: true,
    });

    return this.usersRepository.save(userAdminModel);
  }

  async deleteUser(searchId: string): Promise<boolean> {
    return this.usersRepository.deleteUser(searchId);
  }
}

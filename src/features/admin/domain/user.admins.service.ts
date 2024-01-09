import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { UserAccount, UserAccountDocument } from '../userAccount.schema';
import { AuthUserType } from 'src/features/auth/api/models/auth.output.models/auth.user.types';
import { BcryptAdapter } from 'src/infra/adapters/bcrypt-adapter';

@Injectable()
export class AdminUserService {
  constructor(
    private bcryptAdapter: BcryptAdapter,
    private usersRepository: UsersRepository,
  ) {}

  async createUser(
    createUser: AuthUserType,
  ): Promise<UserAccountDocument | null> {
    const { email, login, password } = createUser;

    const { passwordSalt, passwordHash } =
      await this.bcryptAdapter.createHash(password)

    const userAdminDto = UserAccount.makeInstance({
      login,
      email,
      passwordHash,
      passwordSalt,
      isConfirmed: true
    });

    return this.usersRepository.create(userAdminDto);
  }

  async deleteUser(searchId: string): Promise<boolean> {
    return this.usersRepository.deleteUser(searchId);
  }
}

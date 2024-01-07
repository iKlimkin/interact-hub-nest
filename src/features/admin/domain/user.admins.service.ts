import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { UserAccount, UserAccountDocument } from '../userAccount.schema';
import { bcryptAdapter } from 'src/features/general-models/adapters/bcrypt-adapter';
import { AuthUserType } from 'src/features/auth/api/models/auth.output.models/auth.user.types';

@Injectable()
export class AdminUserService {
  constructor(private usersRepository: UsersRepository) {}

  async createUser(
    createUser: AuthUserType,
  ): Promise<UserAccountDocument | null> {
    const { email, login, password } = createUser;

    const { passwordSalt, passwordHash } =
      await bcryptAdapter.createHash(password);

    const userAdminDto = UserAccount.makeInstance({
      login,
      email,
      passwordHash,
      passwordSalt,
      isConfirmed: true,
    });

    return this.usersRepository.create(userAdminDto);
  }

  async deleteUser(searchId: string): Promise<boolean> {
    return this.usersRepository.deleteUser(searchId);
  }
}

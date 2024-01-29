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
import { LayerNoticeInterceptor } from '../../../infra/utils/error-layer-interceptor';
import { CreateUserErrors } from '../../../infra/utils/interlayer-error-handler.ts/user-errors';

export type CreateUserResultData = {
  userId: string;
};

@Injectable()
export class AdminUserService {
  constructor(
    @InjectModel(UserAccount.name)
    private UserAccountModel: UserAccountModelType,
    private bcryptAdapter: BcryptAdapter,
    private usersRepository: UsersRepository,
  ) {}

  async createUser(
    createUser: AuthUserType,
  ): Promise<LayerNoticeInterceptor<CreateUserResultData>> {
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

    const notice = new LayerNoticeInterceptor<CreateUserResultData>();
    const user = await this.usersRepository.save(userAdminModel);

    if (!user) {
      notice.addError(
        'Could not create user',
        'db',
        CreateUserErrors.DatabaseFail,
      );
    } else {
      notice.addData({ userId: user._id.toString() });
    }

    return notice;
  }

  async deleteUser(searchId: string): Promise<boolean> {
    return this.usersRepository.deleteUser(searchId);
  }
}

import { UserAccountDBType } from 'src/features/auth/api/models/auth.output.models/auth.output.models';
import { UserViewModel } from './userAdmin.view.model';

export const getUserViewModel = (user: UserAccountDBType): UserViewModel => ({
  id: user._id.toString(),
  login: user.accountData.login,
  email: user.accountData.email,
  createdAt: user.accountData.createdAt,
});

import { UsersResponseModel } from '../../../../auth/api/models/auth.output.models/auth-sql.output.models';
import { UserAccount } from '../../../domain/entities/user-account.entity';
import { SAViewModel } from './userAdmin.view.model';

export const getSAViewSQLModel = (user: UsersResponseModel | UserAccount): SAViewModel => ({
  id: user.id,
  login: user.login,
  email: user.email,
  createdAt: user.created_at.toISOString(),
});

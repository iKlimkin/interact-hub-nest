import { UsersResponseModel } from '../../../../auth/api/models/auth.output.models/auth-sql.output.models';
import { SAViewModel } from './userAdmin.view.model';

export const getSAViewSQLModel = (user: UsersResponseModel): SAViewModel => ({
  id: user.id,
  login: user.login,
  email: user.email,
  createdAt: user.created_at,
});

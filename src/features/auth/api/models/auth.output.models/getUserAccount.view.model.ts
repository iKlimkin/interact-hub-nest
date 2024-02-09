import { WithId } from 'mongodb';
import {
  UserAccountType,
  UserAccountViewModel,
  UsersResponseModel,
} from './auth.output.models';

export const getUserAccountViewModel = (
  user: WithId<UserAccountType>,
): UserAccountViewModel => ({
  accountData: {
    id: user._id.toString(),
    login: user.accountData.login,
    email: user.accountData.email,
    createdAt: user.accountData.createdAt,
  },
  emailConfirmation: {
    confirmationCode: user.emailConfirmation.confirmationCode,
    expirationDate: user.emailConfirmation.expirationDate,
    isConfirmed: user.emailConfirmation.isConfirmed,
  },
});

export const getUserAccountSqlViewModel = (
  user: UsersResponseModel,
): UserAccountViewModel => ({
  accountData: {
    id: user.id,
    login: user.login,
    email: user.email,
    createdAt: user.created_at,
  },
  emailConfirmation: {
    confirmationCode: user.confirmation_code,
    expirationDate: user.confirmation_expiration_date.toString(),
    isConfirmed: user.is_confirmed,
  },
});

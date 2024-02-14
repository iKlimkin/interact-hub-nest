import { UsersResponseModel } from "./auth-sql.output.models";
import { UserAccountViewModel } from "./auth.output.models";

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

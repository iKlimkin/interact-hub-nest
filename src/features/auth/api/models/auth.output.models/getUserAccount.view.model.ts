import { WithId } from "mongodb";
import { UserAccountType, UserAccountViewModel } from "./auth.output.models";

export const getUserAccountViewModel = (
  user: WithId<UserAccountType>
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

import { WithId } from 'mongodb';
import { SAViewModel } from '../../../../admin/api/models/userAdmin.view.models/userAdmin.view.model';

export type UserType = {
  login: string;
  email: string;
  createdAt: string;
  passwordSalt: string;
  passwordHash: string;
};

export type UserRecoveryType = {
  recoveryCode: string;
  expirationDate: string;
};

export type UserAccountDBType = WithId<UserAccountType>;

export type UserAccountType = {
  accountData: UserType;
  emailConfirmation: UserConfirmationType;
  passwordRecovery: UserRecoveryType;
};

export type UserAccountViewModel = {
  accountData: SAViewModel;
  emailConfirmation: UserConfirmationType;
};

export type UserConfirmationType = {
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
};

export interface UsersSQLDto
  extends Omit<UsersResponseModel, 'id' | 'created_at' | 'password_recovery_code' | 'password_recovery_expiration'> {}

export interface UsersResponseModel {
  id: string;
  login: string;
  email: string;
  password_salt: string;
  password_hash: string;
  created_at: Date;
  confirmation_code: string;
  confirmation_expiration_date: Date;
  is_confirmed: boolean;
  password_recovery_code: string | null;
  password_recovery_expiration: string | null;
}

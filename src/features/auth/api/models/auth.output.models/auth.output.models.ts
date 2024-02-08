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
  extends Omit<UsersResponseDto, 'id' | 'created_at'> {}

export interface UsersResponseDto {
  id: string;
  login: string;
  email: string;
  passwordSalt: string;
  passwordHash: string;
  created_at: Date;
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
  recoveryCode?: string;
}

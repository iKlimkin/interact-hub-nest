import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import {
  UserAccountType,
  UserConfirmationType,
  UserRecoveryType,
  UserType,
} from '../auth/api/models/auth.output.models/auth.output.models';
import { CreateUserDto } from './api/models/createUser.model';
import { HydratedDocument, Model } from 'mongoose';

const accountData = {
  login: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: String, require: true },
  passwordSalt: { type: String, required: true },
  passwordHash: { type: String, required: true },
};

const emailConfirmation = {
  confirmationCode: { type: String, required: true },
  expirationDate: { type: String, required: true },
  isConfirmed: { type: Boolean, required: true },
};

const passwordRecovery = {
  recoveryCode: { type: String, default: null },
  expirationDate: { type: String, default: null },
};

@Schema({
  timestamps: true,
})
export class UserAccount {
  @Prop({ type: accountData })
  accountData: UserType;

  @Prop({ type: emailConfirmation })
  emailConfirmation: UserConfirmationType;

  @Prop({ type: passwordRecovery })
  passwordRecovery: UserRecoveryType;

  static makeInstance(dto: CreateUserDto): UserAccountType {
    const userAccount = new UserAccount();
    userAccount.accountData = {
      login: dto.login,
      email: dto.email,
      passwordHash: dto.passwordHash,
      passwordSalt: dto.passwordSalt,
      createdAt: new Date().toISOString(),
    };
    userAccount.emailConfirmation = {
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), { hours: 1, minutes: 15 }).toISOString(),
      isConfirmed: dto.isConfirmed,
    };

    return userAccount;
  }
}

export type UserAccountDocument = HydratedDocument<UserAccount>;
export type UserAccountModelType = Model<UserAccountDocument> &
  UserAccountModelStaticType;
export type UserAccountModelDocumentType = Model<UserAccountDocument>;

export type UserAccountModelStaticType = {
  makeInstance(dto: CreateUserDto): UserAccountType;
};

export const userAccountStaticMethods: UserAccountModelStaticType = {
  makeInstance: UserAccount.makeInstance,
};

export const UserAccountSchema = SchemaFactory.createForClass(UserAccount);

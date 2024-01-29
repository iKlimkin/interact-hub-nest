import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import {
  UserAccountViewModel,
  UserConfirmationType,
  UserRecoveryType,
  UserType,
} from '../../../auth/api/models/auth.output.models/auth.output.models';
import { CreateUserDto } from '../../api/models/create-user.model';
import { HydratedDocument, Model } from 'mongoose';
import { SAViewModel } from '../../api/models/userAdmin.view.models/userAdmin.view.model';

export type UserAccountDocument = HydratedDocument<UserAccount>;
export type UserAccountModelType = Model<UserAccountDocument> &
  UserAccountModelStaticsType;

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
  @Prop({ _id: false, type: accountData })
  accountData: UserType;

  @Prop({ _id: false, type: emailConfirmation })
  emailConfirmation: UserConfirmationType;

  @Prop({ type: passwordRecovery })
  passwordRecovery: UserRecoveryType;

  static makeInstance(dto: CreateUserDto): UserAccountDocument {
    const userAccount = new this() as UserAccountDocument;

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
      isConfirmed: dto.isConfirmed || false,
    };

    return userAccount;
  }

  canBeConfirmed(code: string): boolean {
    return (
      !this.emailConfirmation.isConfirmed &&
      this.emailConfirmation.confirmationCode === code
    );
  }

  updateHashAndSalt(hash: string, salt: string) {
    this.accountData.passwordHash = hash;
    this.accountData.passwordSalt = salt;
  }

  confirm(): void {
    this.emailConfirmation.isConfirmed = true;
  }

  getUserAccountViewModel(user: UserAccountDocument): UserAccountViewModel {
    return {
      accountData: {
        id: user._id.toString(),
        login: this.accountData.login,
        email: this.accountData.email,
        createdAt: this.accountData.createdAt,
      },
      emailConfirmation: {
        confirmationCode: this.emailConfirmation.confirmationCode,
        expirationDate: this.emailConfirmation.expirationDate,
        isConfirmed: this.emailConfirmation.isConfirmed,
      },
    };
  }

  getSAViewModel(user: UserAccountDocument): SAViewModel {
    return {
      id: user._id.toString(),
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
    };
  }
}

export const UserAccountSchema = SchemaFactory.createForClass(UserAccount);

export const UserAccountStatics = {
  makeInstance: UserAccount.makeInstance,
};

export const UserAccountMethods = {
  confirm: UserAccount.prototype.confirm,
  canBeConfirmed: UserAccount.prototype.canBeConfirmed,
  getSAViewModel: UserAccount.prototype.getSAViewModel,
  updateHashAndSalt: UserAccount.prototype.updateHashAndSalt,
  getUserAccountViewModel: UserAccount.prototype.getUserAccountViewModel,
};

type UserAccountModelStaticsType = typeof UserAccountStatics;
type UserAccountModelMethodsType = typeof UserAccountMethods;

UserAccountSchema.statics = UserAccountStatics;
UserAccountSchema.methods = UserAccountMethods;

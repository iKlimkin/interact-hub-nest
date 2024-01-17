import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';
import {
  UserAccount,
  UserAccountDocument,
  UserAccountModelType,
} from 'src/features/admin/domain/entities/userAccount.schema';
import { BcryptAdapter } from 'src/infra/adapters/bcrypt-adapter';
import { EmailManager } from 'src/infra/application/managers/email-manager';
import { OutputId } from 'src/infra/likes.types';
import { v4 as uuidv4 } from 'uuid';
import { PasswordRecoveryType } from '../api/models/auth-input.models.ts/input-password-rec.type';
import {
  UserAccountViewModel,
  UserRecoveryType
} from '../api/models/auth.output.models/auth.output.models';
import {
  AuthUserType,
  LoginCredentials,
} from '../api/models/auth.output.models/auth.user.types';
import { AuthRepository } from '../infrastructure/authUsers-repository';

export type UserIdType = {
  userId: string;
};

@Injectable()
export class AuthUserService {
  constructor(
    @InjectModel(UserAccount.name)
    private UserAccountModel: UserAccountModelType,
    private authUsersRepository: AuthRepository,
    private bcryptAdapter: BcryptAdapter,
    private emailManager: EmailManager,
  ) {}

  async createUser(
    inputData: AuthUserType,
  ): Promise<UserAccountDocument | null> {
    const { email, login, password } = inputData;

    const { passwordSalt, passwordHash } =
      await this.bcryptAdapter.createHash(password);

    const foundUserByEmail = await this.authUsersRepository.findByLoginOrEmail({
      email,
    });

    if (foundUserByEmail) return null;

    const smartUserModel = this.UserAccountModel.makeInstance({
      login,
      email,
      passwordHash,
      passwordSalt,
    });

    const result = await this.authUsersRepository.save(smartUserModel);

    try {
      if (result)
        this.emailManager.sendEmailConfirmationMessage(
          email,
          result.emailConfirmation.confirmationCode,
        );
    } catch (error) {
      await this.authUsersRepository.deleteUser(smartUserModel.id);
      return null;
    }

    return result;
  }

  async checkCredentials(
    credentials: LoginCredentials,
  ): Promise<UserIdType | null> {
    const user = await this.authUsersRepository.findByLoginOrEmail({
      loginOrEmail: credentials.loginOrEmail,
    });

    if (!user) return null;

    const validPassword = this.bcryptAdapter.compareAsync(
      credentials.password,
      user.accountData.passwordHash,
    );

    if (!validPassword) return null;

    return {
      userId: user._id.toString(),
    };
  }

  async createTemporaryUserAccount(email: string): Promise<OutputId> {
    const recoveryPassInfo: UserRecoveryType = createRecoveryCode();

    const temporaryUserAccount =
      await this.authUsersRepository.createTemporaryUserAccount(
        recoveryPassInfo,
        email,
      );

    this.sendRecoveryMsg(email, recoveryPassInfo);

    return temporaryUserAccount;
  }

  async passwordRecovery(email: string): Promise<boolean> {
    const recoveryPassInfo: UserRecoveryType = createRecoveryCode();

    const updateRecoveryCode =
      await this.authUsersRepository.updateRecoveryCode(
        email,
        recoveryPassInfo,
      );

    if (!updateRecoveryCode) return updateRecoveryCode;

    this.sendRecoveryMsg(email, recoveryPassInfo);

    return updateRecoveryCode;
  }

  async updatePassword(inputData: PasswordRecoveryType): Promise<boolean> {
    const { recoveryCode, newPassword } = inputData;

    const foundExistingUserAccount =
      await this.authUsersRepository.findUserByRecoveryCode(recoveryCode);

    const foundTemporaryUserAccount =
      await this.authUsersRepository.findTemporaryUserAccountByCode(
        recoveryCode,
      );

    const { passwordHash, passwordSalt } =
      await this.bcryptAdapter.createHash(newPassword);

    if (foundExistingUserAccount) {
      const updatedUserPasswords =
        await this.authUsersRepository.updateUserPassword({
          passwordHash,
          passwordSalt,
          recoveryCode,
        });

      return updatedUserPasswords;
    }

    if (foundTemporaryUserAccount) {
      const uniqueLogin = uuidv4();

      const createdUser = await this.createUser({
        login: uniqueLogin,
        email: foundTemporaryUserAccount.email,
        password: newPassword,
      });

      const deleteTempAccount =
        await this.authUsersRepository.deleteTemporaryUserAccount(recoveryCode);
      return !!createdUser;
    }

    return false;
  }

  async confirmEmail(code: string): Promise<UserAccountDocument> {
    const user = await this.authUsersRepository.findUserByConfirmationCode(
      code
    );

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const { isConfirmed, confirmationCode } = user.emailConfirmation;

    if (isConfirmed || confirmationCode !== code) {
      throw new BadRequestException()
    }

   
    // user.confirm(); user.confirm is not a function
    user.emailConfirmation.isConfirmed = true
    const result = await this.authUsersRepository.save(user);

    return result
  }

  async updateConfirmationCode(
    user: UserAccountViewModel
  ): Promise<boolean> {
    const newConfirmationCode = uuidv4();
    const { email } = user.accountData
    try {
      const updatedCode = await this.authUsersRepository.updateConfirmationCode(
        email,
        newConfirmationCode
      );

      const confirmLetter =
        await this.emailManager.sendEmailConfirmationMessage(
          email,
          newConfirmationCode
        );
    } catch (error) {
      throw new InternalServerErrorException('during update confirmation occured some problems', error)
    }

    return !!newConfirmationCode
  }

  private sendRecoveryMsg(email: string, recoveryPassInfo: UserRecoveryType) {
    return this.emailManager.sendEmailRecoveryMessage(
      email,
      recoveryPassInfo.recoveryCode,
    );
  }
}

function createRecoveryCode(): UserRecoveryType {
  return {
    recoveryCode: uuidv4(),
    expirationDate: add(new Date(), { minutes: 45 }).toISOString(),
  };
}

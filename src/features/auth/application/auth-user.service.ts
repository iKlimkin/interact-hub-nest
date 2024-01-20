import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { PasswordRecoveryType } from '../api/models/auth-input.models.ts/input-password-rec.type';
import {
  UserRecoveryType,
  UserAccountViewModel,
} from '../api/models/auth.output.models/auth.output.models';
import {
  AuthUserType,
  LoginCredentials,
} from '../api/models/auth.output.models/auth.user.types';
import { AuthRepository } from '../infrastructure/authUsers-repository';
import { BcryptAdapter } from '../../../infra/adapters/bcrypt-adapter';
import { EmailManager } from '../../../infra/application/managers/email-manager';
import { OutputId } from '../../../infra/likes.types';
import {
  UserAccount,
  UserAccountModelType,
  UserAccountDocument,
} from '../../admin/domain/entities/userAccount.schema';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from './use-cases/create-user-use-case';

export type UserIdType = {
  userId: string;
};

@Injectable()
export class AuthUserService {
  constructor(
    @InjectModel(UserAccount.name)
    private commandBus: CommandBus,
    private authUsersRepository: AuthRepository,
    private bcryptAdapter: BcryptAdapter,
    private emailManager: EmailManager,
  ) {}

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

      const createdUser = await this.commandBus.execute(
        new CreateUserCommand({
          login: uniqueLogin,
          email: foundTemporaryUserAccount.email,
          password: newPassword,
      })
      )

      const deleteTempAccount =
        await this.authUsersRepository.deleteTemporaryUserAccount(recoveryCode);
      return !!createdUser;
    }

    return false;
  }

  async confirmEmail(code: string): Promise<UserAccountDocument | null> {
    const user =
      await this.authUsersRepository.findUserByConfirmationCode(code);
    // throw new BadRequestException([{ message: 'confirmation code not found', field: 'code' }]);
    if (!user) return null

    const { isConfirmed, confirmationCode } = user.emailConfirmation;

    //  throw new BadRequestException([{ message: 'user is already confirmed', field: 'code' }]);

    if (isConfirmed || confirmationCode !== code) return null

    // user.confirm(); user.confirm is not a function
    user.emailConfirmation.isConfirmed = true;
    const result = await this.authUsersRepository.save(user);

    return result;
  }

  async updateConfirmationCode(user: UserAccountViewModel): Promise<boolean> {
    const newConfirmationCode = uuidv4();
    const { email } = user.accountData;
    try {
      const updatedCode = await this.authUsersRepository.updateConfirmationCode(
        email,
        newConfirmationCode,
      );

      const confirmLetter =
        await this.emailManager.sendEmailConfirmationMessage(
          email,
          newConfirmationCode,
        );
    } catch (error) {
      throw new InternalServerErrorException(
        'during update confirmation occured some problems',
        error,
      );
    }

    return !!newConfirmationCode;
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

import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UserAccount, UserAccountDocument, UserAccountModelType } from "src/features/admin/domain/entities/userAccount.schema";
import { AuthRepository } from "../infrastructure/authUsers-repository";
import { EmailManager } from "src/infra/application/managers/email-manager";
import { UserAccountDBType } from "../api/models/auth.output.models/auth.output.models";
import { AuthUserType, LoginCredentials } from "../api/models/auth.output.models/auth.user.types";
import { BcryptAdapter } from "src/infra/adapters/bcrypt-adapter";
import { OutputId } from "src/infra/likes.types";


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
    private emailManager: EmailManager
  ) {}

  async createUser(
    inputData: AuthUserType
  ): Promise<UserAccountDocument | null> {
    const { email, login, password } = inputData;

    const { passwordSalt, passwordHash } = await this.bcryptAdapter.createHash(
      password
    );

    const foundUserByEmail = await this.authUsersRepository.findByLoginOrEmail({email})

    if (foundUserByEmail) return null

    const foundUserByLogin = await this.authUsersRepository.findByLoginOrEmail({login})

    if (foundUserByLogin) return null

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
          result.emailConfirmation.confirmationCode
        );
    } catch (error) {
      await this.authUsersRepository.deleteUser(smartUserModel.id);
      return null
    }

    return result
  }

  async checkCredentials(
    credentials: LoginCredentials
  ): Promise<UserIdType | null> {
    const user = await this.authUsersRepository.findByLoginOrEmail({
      loginOrEmail: credentials.loginOrEmail,
    });

    if (!user) return null
    
    const validPassword = this.bcryptAdapter.compareAsync(
      credentials.password,
      user.accountData.passwordHash
    );

    if (!validPassword) return null

    return {
      userId: user._id.toString(),
    }
  }

  // async createTemporaryUserAccount(email: string): Promise<Result<OutputId>> {
  //   const recoveryPassInfo: UserRecoveryType = {
  //     recoveryCode: uuidv4(),
  //     expirationDate: add(new Date(), { minutes: 45 }).toISOString(),
  //   };

  //   const temporaryUserAccount =
  //     await this.authUsersRepository.createTemporaryUserAccount(
  //       recoveryPassInfo,
  //       email
  //     );

  //   if (!temporaryUserAccount) return Result.dbLayDown();

  //   const recoveryMailer = await this.emailManager.sendEmailRecoveryMessage(
  //     email,
  //     recoveryPassInfo.recoveryCode!
  //   );

  //   if (!recoveryMailer) return Result.emailDelivery();

  //   return Result.success<OutputId>(temporaryUserAccount);
  // }

  // async passwordRecovery(email: string): Promise<Result<OutputId | boolean>> {
  //   const recoveryPassInfo: UserRecoveryType = {
  //     recoveryCode: uuidv4(),
  //     expirationDate: add(new Date(), { minutes: 45 }).toISOString(),
  //   };

  //   const updateRecoveryCode =
  //     await this.authUsersRepository.updateRecoveryCode(
  //       email,
  //       recoveryPassInfo
  //     );

  //   if (updateRecoveryCode === false) return Result.notFound();
  //   if (updateRecoveryCode === null) return Result.dbLayDown();

  //   const recoveryMailer = await this.emailManager.sendEmailRecoveryMessage(
  //     email,
  //     recoveryPassInfo.recoveryCode!
  //   );

  //   if (!recoveryMailer) {
  //     return Result.emailDelivery(
  //       "Unexpected errors occurred while sending the recovery message"
  //     );
  //   }

  //   return Result.success<boolean>(updateRecoveryCode);
  // }

  // async updatePassword(
  //   inputData: PasswordRecoveryType
  // ): Promise<Result<UserAccountDBType | null | boolean>> {
  //   const { recoveryCode, newPassword } = inputData;

  //   const foundExistingUserAccount =
  //     await this.authUsersRepository.findUserByRecoveryCode(recoveryCode);

  //   const foundTemporaryUserAccount =
  //     await this.authUsersRepository.findTemporaryUserAccountByCode(
  //       recoveryCode
  //     );
  //   const { passwordHash, passwordSalt } = await bcryptAdapter.createHash(
  //     newPassword
  //   );

  //   if (foundExistingUserAccount) {
  //     const updatedUserPasswords =
  //       await this.authUsersRepository.updateUserPassword({
  //         passwordHash,
  //         passwordSalt,
  //         recoveryCode,
  //       });

  //     if (!updatedUserPasswords) return Result.dbLayDown();

  //     return Result.success<boolean>(updatedUserPasswords);
  //   }

  //   if (foundTemporaryUserAccount) {
  //     const uniqueLogin = uuidv4();

  //     const createdUser = await this.createUser({
  //       login: uniqueLogin,
  //       email: foundTemporaryUserAccount.email,
  //       password: newPassword,
  //     });

  //     const deleteTempAccount =
  //       await this.authUsersRepository.deleteTemporaryUserAccount(recoveryCode);

  //     if (deleteTempAccount === null) return Result.dbLayDown();

  //     return createdUser;
  //   }

  //   return Result.invalidRecoveryCode("Invalid or expired recovery code");
  // }

  // async confirmEmail(code: string): Promise<Result<boolean>> {
  //   const user = await this.authUsersRepository.findUserByConfirmationCode(
  //     code
  //   );

  //   if (!user) {
  //     return Result.notFound<boolean>("User not found by confirmationCode or code is expired");
  //   }

  //   const { isConfirmed, confirmationCode } = user.emailConfirmation;

  //   if (isConfirmed) {
  //     return Result.alreadyConfirmed<boolean>("Email is already confirmed");
  //   }

  //   if (confirmationCode !== code) {
  //     return Result.invalidCode<boolean>("Code dont't match or expired");
  //   }

  //   // user.confirm(); user.confirm is not a function
  //   user.emailConfirmation.isConfirmed = true
  //   const result = await this.authUsersRepository.save(user);

  //   // const updatedConfirmation =
  //   //   await this.authUsersRepository.updateConfirmation(user.id);

  //   // if (!updatedConfirmation) {
  //   //   return Result.dbLayDown<boolean>("During update occured some promlems");
  //   // }

  //   return Result.success<boolean>(true);
  // }

  // async updateConfirmationCode(
  //   user: UserAccountViewModel
  // ): Promise<Result<string>> {
  //   const newConfirmationCode = uuidv4();
  //   try {
  //     const updatedCode = await this.authUsersRepository.updateConfirmationCode(
  //       user.accountData.email,
  //       newConfirmationCode
  //     );

  //     if (!updatedCode) {
  //       return Result.dbLayDown("Database is not responding");
  //     }

  //     const confirmLetter =
  //       await this.emailManager.sendEmailConfirmationMessage(
  //         user.accountData.email,
  //         newConfirmationCode
  //       );

  //     if (!confirmLetter) {
  //       return Result.dbLayDown("Mail delivery services are not responding");
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     return Result.dbLayDown("Unexpected error occurred");
  //   }

  //   return Result.success(newConfirmationCode);
  // }
}

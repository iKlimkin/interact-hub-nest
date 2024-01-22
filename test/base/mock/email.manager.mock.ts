import { EmailManager } from '../../../src/infra/application/managers/email-manager';

export const EmailServiceMockObject = {
  sendEmailConfirmationMessage: jest.fn().mockImplementation(async () => {
    console.log('Call mock method sendPasswordRecoveryMail / MailService');
    return true;
  }),
  sendEmailRecoveryMessage: jest.fn().mockImplementation(async () => {
    console.log('Call mock method sendPasswordRecoveryMail / MailService');
    return true;
  }),
};

//  .overrideProvider(UsersService)
//  .useClass(UserServiceMock)
// or
// .overrideProvider(UsersService)
// .useFactory({
//      factory: (usersRepo: UsersRepository) => {
//          return new UserServiceMock(usersRepo);
//      },
//      inject: [UsersRepository]
//      }
//     )

export class EmailManagerMock extends EmailManager {
  async sendEmailConfirmationMessage(
    email: string,
    confirmationCode: string,
  ): Promise<void> {
    await Promise.resolve();
  }
  async sendEmailRecoveryMessage(
    email: string,
    recoveryCode: string,
  ): Promise<void> {
    await Promise.resolve();
  }
}

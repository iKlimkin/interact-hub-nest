
// export const EmailServiceMockObject = {
//   sendEmailConfirmationMessage: jest.fn().mockImplementation(async () => {
//     console.log('Call mock method sendPasswordRecoveryMail / MailService');
//     return true;
//   }),
//   sendEmailRecoveryMessage: jest.fn().mockImplementation(async () => {
//     console.log('Call mock method sendPasswordRecoveryMail / MailService');
//     return true;
//   }),
// };

export class EmailManagerMock {
  async sendEmailConfirmationMessage(): Promise<void> {
    await Promise.resolve();
  }
  async sendEmailRecoveryMessage(): Promise<void> {
    await Promise.resolve();
  }
}

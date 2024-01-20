import { SentMessageInfo } from 'nodemailer';
import { EmailAdapter } from '../../adapters/email-adapter';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailManager {
  constructor(private emailAdapter: EmailAdapter) {}
  async sendEmailRecoveryMessage(
    email: string,
    recoveryCode: string,
  ): Promise<SentMessageInfo> {
    const subject = 'Password recovery';
    return await this.emailAdapter.sendEmail({ email, subject, recoveryCode });
  }

  async sendEmailConfirmationMessage(
    email: string,
    confirmationCode: string,
  ): Promise<SentMessageInfo> {
    const subject = 'Email Confirmation';
    return await this.emailAdapter.confirmationMessage({
      email,
      subject,
      confirmationCode,
    });
  }
}

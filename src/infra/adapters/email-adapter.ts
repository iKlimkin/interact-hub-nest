import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import nodemailer, { SentMessageInfo } from 'nodemailer';

@Injectable()
export class EmailAdapter {
  async sendEmail(inputData: {
    email: string;
    subject: string;
    recoveryCode: string;
  }): Promise<SentMessageInfo | null> {
    const recoveryLink = `https://somesite.com/password-recovery?recoveryCode=${inputData.recoveryCode}`;

    const transporter = this.createTransport();
    
    const message = `
    <p>To finish password recovery please follow the link below:
      <a href='${recoveryLink}'>recovery password</a>
    </p>`;

    try {
      const info: SentMessageInfo = await this.sendMail(
        transporter,
        inputData,
        message,
      );

      return info.messageId;
    } catch (error) {
      throw new HttpException(
        'Failed to send email for password recovery',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async confirmationMessage(inputData: {
    email: string;
    subject: string;
    confirmationCode: string;
  }): Promise<SentMessageInfo> {
    const confirmationLink = `https://somesite.com/confirm-email?code=${inputData.confirmationCode}`;

    const transporter = this.createTransport();

    const message = `<h1>Thank for your registration</h1>
    <p>To finish registration please follow the link below:
        <a href=${confirmationLink}>complete registration</a>
    </p>`;

    try {
      const info: SentMessageInfo = await this.sendMail(
        transporter,
        inputData,
        message,
      );

      return info.messageId;
    } catch (error) {
      throw new HttpException(
        'Failed to send confirmation message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async sendMail(
    transporter: SentMessageInfo,
    inputData: { email: string; subject: string },
    message: string,
  ): Promise<SentMessageInfo> {
    return await transporter.sendMail({
      from: 'Social Hub👻 <iklimkin50@gmail.com>',
      to: inputData.email,
      subject: inputData.subject,
      html: message,
    });
  }

  private createTransport() {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
}

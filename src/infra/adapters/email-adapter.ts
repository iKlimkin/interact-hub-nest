import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { SentMessageInfo } from 'nodemailer';
import { ConfigurationType } from '../../config/configuration';

@Injectable()
export class EmailAdapter {
  constructor(
    private readonly configService: ConfigService<ConfigurationType>,
  ) {}

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
      console.error('Failed to send confirmation message', error);
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
      console.log({ info });

      return info.messageId;
    } catch (error) {
      console.error('Failed to send confirmation message', error);
    }
  }

  private async sendMail(
    transporter: SentMessageInfo,
    inputData: { email: string; subject: string },
    message: string,
  ): Promise<SentMessageInfo> {
    return transporter.sendMail({
      from: 'Social Hub👻 <iklimkin50@gmail.com>',
      to: inputData.email,
      subject: inputData.subject,
      html: message,
    });
  }

  private createTransport() {
    const config = this.configService.get('emailSetting', {
      infer: true,
    });

    return nodemailer.createTransport({
      service: config?.EMAIL_SERVICE,
      auth: {
        user: config?.EMAIL_USER,
        pass: config?.EMAIL_PASSWORD,
      },
    });
  }
}
